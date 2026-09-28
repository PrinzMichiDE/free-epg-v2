export const JOB_STATUSES = ["pending", "running", "completed", "failed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface AdminJobsQuery {
  page: number;
  pageSize: number;
  status?: JobStatus;
  jobType?: string;
}

export interface JobRow {
  id: number;
  jobType: string;
  country: string | null;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  createdAt: string;
}

export interface JobStatusCounts {
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export function parseAdminJobsQuery(searchParams: URLSearchParams): AdminJobsQuery {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize")) || 25, 1), 100);
  const statusParam = searchParams.get("status");
  const status =
    statusParam && JOB_STATUSES.includes(statusParam as JobStatus)
      ? (statusParam as JobStatus)
      : undefined;
  const jobType = searchParams.get("jobType")?.trim() || undefined;

  return { page, pageSize, status, jobType };
}

export type JobStatusBadgeVariant = "default" | "success" | "warning" | "muted";

export function jobStatusBadgeVariant(status: JobStatus): JobStatusBadgeVariant {
  switch (status) {
    case "completed":
      return "success";
    case "running":
      return "warning";
    case "failed":
      return "default";
    case "pending":
      return "muted";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function jobStatusBadgeVariantForUnknown(
  status: string
): JobStatusBadgeVariant {
  if (JOB_STATUSES.includes(status as JobStatus)) {
    return jobStatusBadgeVariant(status as JobStatus);
  }
  return "muted";
}

export function formatJobDuration(
  startedAt: string | null | undefined,
  finishedAt: string | null | undefined
): string | null {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;

  const totalSec = Math.round((end - start) / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export function summarizeJobStatuses(jobs: Pick<JobRow, "status">[]): JobStatusCounts {
  const counts: JobStatusCounts = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  };

  for (const job of jobs) {
    if (job.status in counts) {
      counts[job.status as JobStatus] += 1;
    }
  }

  return counts;
}
