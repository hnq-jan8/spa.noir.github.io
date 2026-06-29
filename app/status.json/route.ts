import { NextResponse } from "next/server";
import { getBuildMode } from "@/lib/buildMode";

// Static export: /status.json build sẵn, on compile,
// client từ đây biết status thay đổi mà không cần gọi backend
export const dynamic = "force-static";

export async function GET() {
  const { active } = await getBuildMode();
  return NextResponse.json({ active });
}
