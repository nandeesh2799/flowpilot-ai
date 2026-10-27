/**
 * FlowPilot AI — Core Domain Types
 */

export type TicketStatus =
  | "new"
  | "triaged"
  | "in_progress"
  | "waiting_on_customer"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketCategory =
  | "account_access"
  | "billing_refund"
  | "technical_issue"
  | "feature_request"
  | "service_outage"
  | "security_incident"
  | "general_inquiry";

export type SupportTeam =
  | "general_support"
  | "technical_support"
  | "billing"
  | "security_compliance"
  | "executive_escalations"
  | "unassigned";

export type TicketChannel = "email" | "chat" | "web_form" | "api";

export type SentimentType = "positive" | "neutral" | "negative" | "frustrated";

export interface Ticket {
  id: string;
  title: string;
  customer_name: string;
  customer_email?: string | null;
  channel: TicketChannel;
  reference_id?: string | null;
  customer_context?: string | null;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_team: SupportTeam;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysis {
  id: string;
  ticket_id: string;
  provider: string; // e.g., "google-gemini", "demo-deterministic"
  model: string; // e.g., "gemini-1.5-flash", "demo-rules-v1"
  prompt_version: string;
  status: "success" | "failed" | "pending";
  error_message?: string | null;

  summary: string;
  category: TicketCategory;
  priority: TicketPriority;
  priority_reasoning: string;
  confidence_score: number; // 0.00 to 1.00
  is_uncertain: boolean;
  sentiment: SentimentType;
  recommended_team: SupportTeam;
  recommended_action: string;
  suggested_response: string;
  missing_information: string[];
  potential_security_risk: boolean;
  security_notes?: string | null;

  latency_ms?: number;
  created_at: string;
}

export type ReviewActionType =
  | "approve_suggested_reply"
  | "reject_suggested_reply"
  | "edit_suggested_reply"
  | "reassign_team"
  | "change_priority"
  | "change_status"
  | "resolve_ticket"
  | "reopen_ticket"
  | "retry_ai_analysis"
  | "add_internal_note";

export interface ReviewDecision {
  id: string;
  ticket_id: string;
  ai_analysis_id?: string | null;
  action: ReviewActionType;
  reviewer_name: string;
  edited_response?: string | null;
  rejection_reason?: string | null;
  note?: string | null;
  previous_state?: Record<string, unknown> | null;
  new_state?: Record<string, unknown> | null;
  created_at: string;
}

export type AuditEventType =
  | "ticket_created"
  | "ai_analysis_requested"
  | "ai_analysis_completed"
  | "ai_analysis_failed"
  | "priority_changed"
  | "team_reassigned"
  | "status_changed"
  | "reply_edited"
  | "reply_approved"
  | "reply_rejected"
  | "internal_note_added"
  | "ticket_resolved"
  | "ticket_reopened"
  | "ai_retry_requested";

export interface AuditEvent {
  id: string;
  ticket_id: string;
  event_type: AuditEventType;
  actor_type: "system" | "ai_engine" | "human_reviewer";
  actor_name: string;
  summary: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface TicketWithDetails extends Ticket {
  latest_analysis?: AIAnalysis | null;
  analyses: AIAnalysis[];
  audit_events: AuditEvent[];
  review_decisions: ReviewDecision[];
}

export interface DashboardMetrics {
  total_tickets: number;
  open_and_in_progress: number;
  urgent_and_high_priority: number;
  resolved_tickets: number;
  priority_distribution: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  category_distribution: Record<TicketCategory, number>;
  status_distribution: Record<TicketStatus, number>;
  ai_success_rate: number;
  average_confidence: number;
  recent_tickets: Ticket[];
  system_status: {
    database: "connected" | "demo_local" | "disconnected";
    ai_provider: "live_gemini" | "demo_fallback" | "unconfigured";
    model_name: string;
  };
}
