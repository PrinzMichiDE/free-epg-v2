import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { takedownRequests } from "@freeepg/db";
import { anonymizeIp } from "@freeepg/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      requesterName,
      requesterEmail,
      requesterOrg,
      requestType,
      targetUrl,
      targetContent,
      description,
      signature,
    } = body;

    if (!requesterEmail || !description || !requestType) {
      return NextResponse.json(
        { error: "Missing required fields: requesterEmail, requestType, description" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined;

    await db.insert(takedownRequests).values({
      requesterName: requesterName || null,
      requesterEmail,
      requesterOrg: requesterOrg || null,
      requestType,
      targetUrl: targetUrl || null,
      targetContent: targetContent || null,
      description,
      signature: signature || null,
      status: "pending",
      ipHash: ip ? anonymizeIp(ip) : null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Takedown request received. We will review and respond as soon as possible.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Takedown request error:", error);
    return NextResponse.json(
      { error: "Failed to submit takedown request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Use POST to submit a takedown request",
      requiredFields: ["requesterEmail", "requestType", "description"],
    },
    { status: 200 }
  );
}
