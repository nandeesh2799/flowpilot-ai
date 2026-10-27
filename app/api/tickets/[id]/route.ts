import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const ticket = await repository.getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (err: unknown) {
    console.error("GET /api/tickets/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error while fetching ticket" },
      { status: 500 }
    );
  }
}
