import { NextResponse } from "next/server";
import { getBuildMode } from "@/lib/buildMode";
import { buildContentPayload } from "@/lib/buildContentPayload";

// Static export: /status.json build sẵn, on compile,
// client từ đây biết status thay đổi mà không cần gọi backend
export const dynamic = "force-static";

export async function GET() {
  const [{ active, buildId }, { generatedAt }] = await Promise.all([
    getBuildMode(),
    buildContentPayload(),
  ]);
  return NextResponse.json({ active, since: generatedAt, buildId });
}
