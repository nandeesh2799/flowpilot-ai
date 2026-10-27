import { describe, it, expect } from "vitest";
import {
  CreateTicketSchema,
  AIStructuredOutputSchema,
  ReviewActionSchema,
  InboxQuerySchema,
} from "@/lib/validation";

describe("Unit: CreateTicketSchema Validation", () => {
  it("validates a compliant customer ticket payload", () => {
    const validData = {
      title: "Cannot access API documentation",
      customer_name: "Elena Rostova",
      customer_email: "elena@example.com",
      channel: "web_form",
      reference_id: "REF-100",
      customer_context: "Enterprise customer",
      message: "Please help us find the API documentation for audit endpoints.",
      is_demo: false,
    };
    const result = CreateTicketSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects ticket with title shorter than 3 characters", () => {
    const invalid = {
      title: "Hi",
      customer_name: "John",
      message: "Valid length message for testing customer ticket submission.",
    };
    const result = CreateTicketSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects ticket with message shorter than 10 characters", () => {
    const invalid = {
      title: "Valid title",
      customer_name: "John",
      message: "Too short",
    };
    const result = CreateTicketSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("allows optional email and reference ID to be empty strings or omitted", () => {
    const data = {
      title: "Valid title here",
      customer_name: "Jane Doe",
      customer_email: "",
      reference_id: "",
      message: "Valid length message describing the customer issue.",
    };
    const result = CreateTicketSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe("Unit: AIStructuredOutputSchema Validation", () => {
  it("validates a compliant structured AI output", () => {
    const validAI = {
      summary: "Customer reporting billing discrepancy on invoice.",
      category: "billing_refund",
      priority: "high",
      priority_reasoning: "Duplicate charge reported on credit card statement.",
      confidence_score: 0.94,
      is_uncertain: false,
      sentiment: "negative",
      recommended_team: "billing",
      recommended_action: "Verify Stripe payment logs before issuing credit.",
      suggested_response: "Hello Elena, thank you for reaching out. We are reviewing...",
      missing_information: ["Last 4 digits of card"],
      potential_security_risk: false,
      security_notes: null,
    };
    const result = AIStructuredOutputSchema.safeParse(validAI);
    expect(result.success).toBe(true);
  });

  it("rejects AI output with invalid enum category", () => {
    const invalidAI = {
      summary: "Customer inquiry",
      category: "invalid_category_name",
      priority: "high",
      priority_reasoning: "Reason",
      confidence_score: 0.9,
      is_uncertain: false,
      sentiment: "neutral",
      recommended_team: "billing",
      recommended_action: "Action",
      suggested_response: "Hello customer",
      missing_information: [],
    };
    const result = AIStructuredOutputSchema.safeParse(invalidAI);
    expect(result.success).toBe(false);
  });

  it("rejects confidence score outside 0 to 1 range", () => {
    const invalidAI = {
      summary: "Customer inquiry",
      category: "billing_refund",
      priority: "high",
      priority_reasoning: "Reason",
      confidence_score: 1.5, // Invalid > 1
      is_uncertain: false,
      sentiment: "neutral",
      recommended_team: "billing",
      recommended_action: "Action",
      suggested_response: "Hello customer",
      missing_information: [],
    };
    const result = AIStructuredOutputSchema.safeParse(invalidAI);
    expect(result.success).toBe(false);
  });
});

describe("Unit: ReviewActionSchema Validation", () => {
  it("validates valid review actions", () => {
    const validAction = {
      action: "approve_suggested_reply",
      reviewer_name: "Agent Sarah",
      edited_response: "Customized reply to customer",
    };
    const result = ReviewActionSchema.safeParse(validAction);
    expect(result.success).toBe(true);
  });

  it("rejects unsupported action strings", () => {
    const invalidAction = {
      action: "unsupported_action_type",
      reviewer_name: "Agent Sarah",
    };
    const result = ReviewActionSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });
});
