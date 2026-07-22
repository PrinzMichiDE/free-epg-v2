import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runDetailedSystemHealth } from "@/lib/system-health";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const health = await runDetailedSystemHealth();
  return Response.json(health, {
    status: health.status === "healthy" ? 200 : 503,
  });
}
