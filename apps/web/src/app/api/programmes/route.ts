import { NextRequest } from "next/server";
import { searchProgrammes } from "@/lib/programmes";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const country = searchParams.get("country") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const whenParam = searchParams.get("when");
  const when =
    whenParam === "now" || whenParam === "upcoming" || whenParam === "all"
      ? whenParam
      : "all";

  const result = await searchProgrammes({ q, country, page, when });

  return Response.json(result);
}
