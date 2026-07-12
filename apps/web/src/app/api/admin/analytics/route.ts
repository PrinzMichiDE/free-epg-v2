import { getServerSession } from "next-auth";
import { desc, gte } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { analyticsDaily, analyticsEvents } from "@freeepg/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "7", 10);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const db = getDatabase();
  const daily = await db
    .select()
    .from(analyticsDaily)
    .where(gte(analyticsDaily.date, sinceStr));

  const recentEvents = await db
    .select()
    .from(analyticsEvents)
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(100);

  const pageViews = daily
    .filter((d) => d.metric === "page_views")
    .reduce((s, d) => s + d.value, 0);

  const apiRequests = daily
    .filter((d) => d.metric === "api_requests")
    .reduce((s, d) => s + d.value, 0);

  const countryBreakdown = recentEvents
    .filter((e) => e.type === "api_request" && e.country)
    .reduce(
      (acc, e) => {
        const c = e.country!;
        acc[c] = (acc[c] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  return Response.json({
    summary: { pageViews, apiRequests, days },
    daily,
    topCountries: Object.entries(countryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count })),
  });
}
