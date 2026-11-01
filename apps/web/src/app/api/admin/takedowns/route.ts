import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDatabase } from "@/lib/db";
import { takedownRequests } from "@freeepg/db";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDatabase();
  const requests = await db
    .select()
    .from(takedownRequests)
    .orderBy(desc(takedownRequests.createdAt))
    .limit(100);

  return NextResponse.json({ requests });
}

export async function PATCH(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, actionTaken } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const db = getDatabase();
    await db
      .update(takedownRequests)
      .set({
        status,
        actionTaken: actionTaken || null,
        resolvedBy: token.email as string,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(takedownRequests.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Takedown update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
