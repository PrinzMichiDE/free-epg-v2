import { runSystemHealthChecks } from "@/lib/system-health";

export async function GET() {
  const health = await runSystemHealthChecks();
  return Response.json(health, {
    status: health.status === "healthy" ? 200 : 503,
  });
}
