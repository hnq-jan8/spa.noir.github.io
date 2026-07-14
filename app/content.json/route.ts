import { NextResponse } from "next/server";
import { buildContentPayload } from "@/lib/buildContentPayload";

export const dynamic = "force-static";

export async function GET() {
  const payload = await buildContentPayload();
  return NextResponse.json(payload);
}
