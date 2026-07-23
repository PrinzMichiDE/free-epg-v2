import { getServerSession } from "next-auth";
import { Queue } from "bullmq";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { epgJobs } from "@freeepg/db";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";
import { logAdminAction } from "@/lib/admin-audit";

function clientIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { country, all, iptvOrg } = body as {
    country?: string;
    all?: boolean;
    iptvOrg?: boolean;
  };

  const connection = {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    maxRetriesPerRequest: null,
  };
  const queue = new Queue("epg-jobs", { connection });
  const ip = clientIp(request);

  if (iptvOrg) {
    await queue.add("iptv-org-grab", {}, { attempts: 2 });
    const db = getDatabase();
    await db.insert(epgJobs).values({
      jobType: "iptv_org_grab",
      status: "pending",
    });
    await logAdminAction(session, "jobs.trigger.iptv_org", { ip });
    await queue.close();
    return Response.json({ message: "iptv-org sync queued" });
  }

  if (all) {
    await queue.add("fetch-all-countries", {}, { attempts: 1 });
    const db = getDatabase();
    await db.insert(epgJobs).values({
      jobType: "fetch-all-countries",
      status: "pending",
    });
    await logAdminAction(session, "jobs.trigger.all_countries", { ip });
    await queue.close();
    return Response.json({ message: "Fetch all countries queued" });
  }

  if (country && SUPPORTED_EPG_COUNTRIES.includes(country.toUpperCase())) {
    const cc = country.toUpperCase();
    await queue.add("fetch-country", { country: cc }, { attempts: 2 });
    const db = getDatabase();
    await db.insert(epgJobs).values({
      country: cc,
      jobType: "country_fetch",
      status: "pending",
    });
    await logAdminAction(session, "jobs.trigger.country", {
      target: cc,
      metadata: { country: cc },
      ip,
    });
    await queue.close();
    return Response.json({ message: `Fetch ${country} queued` });
  }

  await queue.close();
  return Response.json({ error: "Invalid country" }, { status: 400 });
}
