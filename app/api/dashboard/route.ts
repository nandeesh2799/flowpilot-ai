import { NextResponse } from "next/server";
import { repository } from "@/lib/db";

export async function GET() {
  try {
    const metrics = await repository.getDashboardMetrics();
    return NextResponse.json(metrics);
  } catch (err: unknown) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json(
      { error: "Internal server error while fetching dashboard metrics" },
      { status: 500 }
    );
  }
}
