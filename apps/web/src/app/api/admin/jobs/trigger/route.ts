import { getServerSession } from "next-auth";
import { Queue } from "bullmq";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { epgJobs } from "@freeepg/db";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";

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

  if (iptvOrg) {
    await queue.add("iptv-org-grab", {}, { attempts: 2 });
    const db = getDatabase();
    await db.insert(epgJobs).values({
      jobType: "iptv_org_grab",
      status: "pending",
    });
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
    await queue.close();
    return Response.json({ message: "Fetch all countries queued" });
  }

  if (country && EPG_PW_COUNTRIES.includes(country.toUpperCase())) {
    await queue.add("fetch-country", { country: country.toUpperCase() }, { attempts: 2 });
    const db = getDatabase();
    await db.insert(epgJobs).values({
      country: country.toUpperCase(),
      jobType: "country_fetch",
      status: "pending",
    });
    await queue.close();
    return Response.json({ message: `Fetch ${country} queued` });
  }

  return Response.json({ error: "Invalid country" }, { status: 400 });
}
