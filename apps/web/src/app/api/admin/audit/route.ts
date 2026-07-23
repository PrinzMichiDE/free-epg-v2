import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listRecentAdminAuditLogs } from "@/lib/admin-audit";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 200);
  const logs = await listRecentAdminAuditLogs(limit);

  return Response.json({ logs });
}
