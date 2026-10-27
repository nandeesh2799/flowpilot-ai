import { NextRequest, NextResponse } from "next/server";
import { ReviewActionSchema } from "@/lib/validation";
import { reviewService } from "@/lib/review-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = ReviewActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await reviewService.handleReviewAction(id, parsed.data);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("POST /api/tickets/[id]/review error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
