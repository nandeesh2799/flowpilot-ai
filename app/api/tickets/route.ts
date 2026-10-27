import { NextRequest, NextResponse } from "next/server";
import { CreateTicketSchema, InboxQuerySchema } from "@/lib/validation";
import { repository } from "@/lib/db";
import { aiService } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CreateTicketSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, customer_name, customer_email, channel, reference_id, customer_context, message, is_demo } =
      parsed.data;

    // 1. Create ticket in database
    const ticket = await repository.createTicket({
      title,
      customer_name,
      customer_email: customer_email || null,
      channel,
      reference_id: reference_id || null,
      customer_context: customer_context || null,
      message,
      status: "new",
      priority: "medium", // default initial priority until AI triages
      assigned_team: "unassigned",
      is_demo: is_demo || false,
    });

    // 2. Create initial audit event
    await repository.createAuditEvent({
      ticket_id: ticket.id,
      event_type: "ticket_created",
      actor_type: "system",
      actor_name: "Customer Submission",
      summary: `Ticket created via ${channel} by ${customer_name}`,
      metadata: { channel, customer_email: customer_email || "none" },
    });

    // 3. Trigger AI analysis workflow (asynchronous/inline; failures do NOT fail ticket creation)
    const analysisResult = await aiService.processTicketAnalysis(ticket);

    // 4. Fetch updated ticket with analysis and audits
    const fullTicket = await repository.getTicketById(ticket.id);

    return NextResponse.json(
      {
        ticket: fullTicket,
        ai_success: analysisResult.success,
        ai_error: analysisResult.error || null,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("POST /api/tickets error:", err);
    return NextResponse.json(
      { error: "Internal server error while processing ticket creation" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams: Record<string, string | number> = {};

    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const parsedQuery = InboxQuerySchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const result = await repository.listTickets(parsedQuery.data);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("GET /api/tickets error:", err);
    return NextResponse.json(
      { error: "Internal server error while listing tickets" },
      { status: 500 }
    );
  }
}
