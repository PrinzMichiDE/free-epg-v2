import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { customLists } from "@freeepg/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDatabase();
  const [list] = await db
    .select()
    .from(customLists)
    .where(eq(customLists.id, id))
    .limit(1);

  if (!list) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(list);
}
