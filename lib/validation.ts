import { z } from "zod";

export const TicketStatusSchema = z.enum([
  "new",
  "triaged",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed",
]);

export const TicketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const TicketCategorySchema = z.enum([
  "account_access",
  "billing_refund",
  "technical_issue",
  "feature_request",
  "service_outage",
  "security_incident",
  "general_inquiry",
]);

export const SupportTeamSchema = z.enum([
  "general_support",
  "technical_support",
  "billing",
  "security_compliance",
  "executive_escalations",
  "unassigned",
]);

export const TicketChannelSchema = z.enum(["email", "chat", "web_form", "api"]);

export const SentimentSchema = z.enum([
  "positive",
  "neutral",
  "negative",
  "frustrated",
]);

export const CreateTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),
  customer_name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(80, "Customer name cannot exceed 80 characters"),
  customer_email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(120)
    .optional()
    .or(z.literal("")),
  channel: TicketChannelSchema.default("web_form"),
  reference_id: z
    .string()
    .trim()
    .max(50, "Reference ID cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  customer_context: z
    .string()
    .trim()
    .max(500, "Context cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(3000, "Message cannot exceed 3000 characters"),
  is_demo: z.boolean().default(false),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

/**
 * Schema validating structured output from the AI model
 */
export const AIStructuredOutputSchema = z.object({
  summary: z.string().trim().min(5).max(300),
  category: TicketCategorySchema,
  priority: TicketPrioritySchema,
  priority_reasoning: z.string().trim().min(5).max(600),
  confidence_score: z.number().min(0).max(1),
  is_uncertain: z.boolean(),
  sentiment: SentimentSchema,
  recommended_team: SupportTeamSchema,
  recommended_action: z.string().trim().min(5).max(400),
  suggested_response: z.string().trim().min(10).max(1500),
  missing_information: z.array(z.string().trim().max(200)).default([]),
  potential_security_risk: z.boolean().default(false),
  security_notes: z.string().trim().max(400).optional().nullable(),
});

export type AIStructuredOutput = z.infer<typeof AIStructuredOutputSchema>;

/**
 * Schema validating human review actions
 */
export const ReviewActionSchema = z.object({
  action: z.enum([
    "approve_suggested_reply",
    "reject_suggested_reply",
    "edit_suggested_reply",
    "reassign_team",
    "change_priority",
    "change_status",
    "resolve_ticket",
    "reopen_ticket",
    "retry_ai_analysis",
    "add_internal_note",
  ]),
  reviewer_name: z
    .string()
    .trim()
    .min(2, "Reviewer name required")
    .max(80)
    .default("Support Agent"),
  edited_response: z.string().trim().max(2000).optional(),
  rejection_reason: z.string().trim().max(500).optional(),
  note: z.string().trim().max(1000).optional(),
  new_priority: TicketPrioritySchema.optional(),
  new_status: TicketStatusSchema.optional(),
  new_team: SupportTeamSchema.optional(),
});

export type ReviewActionInput = z.infer<typeof ReviewActionSchema>;

/**
 * Inbox Filter & Pagination Query Schema
 */
export const InboxQuerySchema = z.object({
  search: z.string().optional().default(""),
  status: TicketStatusSchema.optional().or(z.literal("all")),
  priority: TicketPrioritySchema.optional().or(z.literal("all")),
  category: TicketCategorySchema.optional().or(z.literal("all")),
  team: SupportTeamSchema.optional().or(z.literal("all")),
  sort_by: z
    .enum(["created_at", "priority", "updated_at"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type InboxQueryInput = z.infer<typeof InboxQuerySchema>;
