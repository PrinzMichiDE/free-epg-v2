import { getServerSession } from "next-auth";
import { and, desc, eq, sql } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { epgJobs } from "@freeepg/db";
import { parseAdminJobsQuery } from "@/lib/admin-jobs-query";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = parseAdminJobsQuery(new URL(request.url).searchParams);
  const db = getDatabase();
  const offset = (query.page - 1) * query.pageSize;

  const filters = [];
  if (query.status) {
    filters.push(eq(epgJobs.status, query.status));
  }
  if (query.jobType) {
    filters.push(eq(epgJobs.jobType, query.jobType));
  }
  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [jobs, countRow, statusRows] = await Promise.all([
    db
      .select({
        id: epgJobs.id,
        jobType: epgJobs.jobType,
        country: epgJobs.country,
        status: epgJobs.status,
        startedAt: epgJobs.startedAt,
        finishedAt: epgJobs.finishedAt,
        error: epgJobs.error,
        createdAt: epgJobs.createdAt,
      })
      .from(epgJobs)
      .where(whereClause)
      .orderBy(desc(epgJobs.createdAt))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(epgJobs)
      .where(whereClause),
    db
      .select({
        status: epgJobs.status,
        count: sql<number>`count(*)::int`,
      })
      .from(epgJobs)
      .groupBy(epgJobs.status),
  ]);

  const statusCounts = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  };
  for (const row of statusRows) {
    if (row.status in statusCounts) {
      statusCounts[row.status as keyof typeof statusCounts] = row.count;
    }
  }

  const total = countRow[0]?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / query.pageSize) : 1;

  return Response.json({
    jobs: jobs.map((job) => ({
      ...job,
      startedAt: job.startedAt?.toISOString() ?? null,
      finishedAt: job.finishedAt?.toISOString() ?? null,
      createdAt: job.createdAt.toISOString(),
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages,
    },
    statusCounts,
    filters: {
      status: query.status ?? null,
      jobType: query.jobType ?? null,
    },
  });
}
