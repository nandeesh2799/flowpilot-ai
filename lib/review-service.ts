import { repository } from "./db";
import { ReviewActionInput } from "./validation";
import { aiService } from "./ai/service";
import { Ticket, TicketWithDetails, AuditEventType } from "./types";

export class ReviewService {
  async handleReviewAction(
    ticketId: string,
    input: ReviewActionInput
  ): Promise<{ success: boolean; ticket: TicketWithDetails | null; message: string }> {
    const ticketWithDetails = await repository.getTicketById(ticketId);
    if (!ticketWithDetails) {
      throw new Error(`Ticket not found: ${ticketId}`);
    }

    const reviewer = input.reviewer_name || "Support Agent";
    let auditEventType: AuditEventType = "status_changed";
    let summary = "";
    const ticketUpdates: Partial<Ticket> = {};
    const previousState: Record<string, unknown> = {
      status: ticketWithDetails.status,
      priority: ticketWithDetails.priority,
      assigned_team: ticketWithDetails.assigned_team,
    };
    const newState: Record<string, unknown> = {};

    switch (input.action) {
      case "approve_suggested_reply": {
        auditEventType = "reply_approved";
        summary = `${reviewer} approved the AI-suggested response for customer dispatch.`;
        newState.reply_status = "approved";
        if (input.edited_response) {
          newState.approved_response = input.edited_response;
        }
        // Advance ticket to in_progress if still triaged/new
        if (ticketWithDetails.status === "new" || ticketWithDetails.status === "triaged") {
          ticketUpdates.status = "in_progress";
          newState.status = "in_progress";
        }
        break;
      }

      case "reject_suggested_reply": {
        auditEventType = "reply_rejected";
        summary = `${reviewer} rejected the suggested response. Reason: ${input.rejection_reason || "Requires customized manual drafting"}`;
        newState.reply_status = "rejected";
        newState.rejection_reason = input.rejection_reason || "None specified";
        break;
      }

      case "edit_suggested_reply": {
        auditEventType = "reply_edited";
        summary = `${reviewer} edited the AI-drafted customer response.`;
        newState.edited_response = input.edited_response;
        break;
      }

      case "change_priority": {
        if (!input.new_priority) throw new Error("new_priority is required for change_priority action");
        auditEventType = "priority_changed";
        summary = `${reviewer} adjusted priority from ${ticketWithDetails.priority.toUpperCase()} to ${input.new_priority.toUpperCase()}`;
        ticketUpdates.priority = input.new_priority;
        newState.priority = input.new_priority;
        break;
      }

      case "reassign_team": {
        if (!input.new_team) throw new Error("new_team is required for reassign_team action");
        auditEventType = "team_reassigned";
        summary = `${reviewer} reassigned ticket from ${ticketWithDetails.assigned_team} to ${input.new_team}`;
        ticketUpdates.assigned_team = input.new_team;
        newState.assigned_team = input.new_team;
        break;
      }

      case "change_status": {
        if (!input.new_status) throw new Error("new_status is required for change_status action");
        auditEventType = "status_changed";
        summary = `${reviewer} changed ticket status from ${ticketWithDetails.status} to ${input.new_status}`;
        ticketUpdates.status = input.new_status;
        newState.status = input.new_status;
        break;
      }

      case "resolve_ticket": {
        auditEventType = "ticket_resolved";
        summary = `${reviewer} marked ticket as RESOLVED.`;
        ticketUpdates.status = "resolved";
        newState.status = "resolved";
        break;
      }

      case "reopen_ticket": {
        auditEventType = "ticket_reopened";
        summary = `${reviewer} REOPENED the ticket for further investigation.`;
        ticketUpdates.status = "in_progress";
        newState.status = "in_progress";
        break;
      }

      case "add_internal_note": {
        if (!input.note) throw new Error("Note content is required");
        auditEventType = "internal_note_added";
        summary = `${reviewer} added an internal note: "${input.note.substring(0, 100)}${input.note.length > 100 ? "..." : ""}"`;
        newState.note = input.note;
        break;
      }

      case "retry_ai_analysis": {
        // Trigger AI analysis retry
        const aiResult = await aiService.processTicketAnalysis(ticketWithDetails, { isRetry: true });
        const updatedTicket = await repository.getTicketById(ticketId);
        return {
          success: aiResult.success,
          ticket: updatedTicket,
          message: aiResult.success ? "AI analysis completed successfully on retry." : `AI retry failed: ${aiResult.error}`,
        };
      }

      default:
        throw new Error(`Unsupported review action: ${(input as any).action}`);
    }

    // Apply updates to ticket if any
    if (Object.keys(ticketUpdates).length > 0) {
      await repository.updateTicket(ticketId, ticketUpdates);
    }

    // Persist review decision
    await repository.createReviewDecision({
      ticket_id: ticketId,
      ai_analysis_id: ticketWithDetails.latest_analysis?.id || null,
      action: input.action,
      reviewer_name: reviewer,
      edited_response: input.edited_response || null,
      rejection_reason: input.rejection_reason || null,
      note: input.note || null,
      previous_state: previousState,
      new_state: newState,
    });

    // Persist audit event
    await repository.createAuditEvent({
      ticket_id: ticketId,
      event_type: auditEventType,
      actor_type: "human_reviewer",
      actor_name: reviewer,
      summary,
      metadata: { previousState, newState, action: input.action },
    });

    const updated = await repository.getTicketById(ticketId);
    return {
      success: true,
      ticket: updated,
      message: summary,
    };
  }
}

export const reviewService = new ReviewService();
