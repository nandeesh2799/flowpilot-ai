import { NextRequest, NextResponse } from "next/server";
import { generateDemoSeedData } from "@/lib/demo-data";
import { localStore } from "@/lib/db/local-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "seed";

    if (action === "reset") {
      localStore.clear();
      return NextResponse.json({ success: true, message: "Demo data cleared successfully" });
    }

    const seedPackage = await generateDemoSeedData();
    localStore.seed(seedPackage);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${seedPackage.tickets.length} realistic demo tickets with analyses and audit events`,
      count: seedPackage.tickets.length,
    });
  } catch (err: unknown) {
    console.error("POST /api/demo/seed error:", err);
    return NextResponse.json(
      { error: "Failed to seed demo data", details: String(err) },
      { status: 500 }
    );
  }
}
