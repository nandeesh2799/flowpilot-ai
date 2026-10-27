import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from "./provider";
import { AIStructuredOutput } from "../validation";
import { CURRENT_PROMPT_VERSION } from "./prompts";

export class DeterministicDemoProvider implements AIProvider {
  public readonly name = "demo-deterministic";
  public readonly modelName = "demo-rules-v1";

  async analyzeTicket(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    const text = `${request.title} ${request.message}`.toLowerCase();

    // 1. PROMPT INJECTION / SECURITY OVERRIDE DETECTION
    const injectionPatterns = [
      "ignore previous instructions",
      "ignore all previous instructions",
      "ignore above instructions",
      "disregard all previous instructions",
      "system prompt",
      "reveal system",
      "bypass safety",
      "override rules",
      "grant admin",
      "jailbreak",
      "roleplay as",
      "execute arbitrary",
    ];

    const hasInjection = injectionPatterns.some((pattern) => text.includes(pattern));

    if (hasInjection) {
      const output: AIStructuredOutput = {
        summary:
          "Potential prompt injection detected. The message attempts to override system instructions or request unauthorized administrative privileges.",
        category: "security_incident",
        priority: "urgent",
        priority_reasoning:
          "The customer message contains explicit adversarial instructions attempting to manipulate automated copilot instructions.",
        confidence_score: 0.98,
        is_uncertain: false,
        sentiment: "frustrated",
        recommended_team: "security_compliance",
        recommended_action:
          "Escalate immediately to Security & Compliance team. Do not execute any automated commands or reveal internal prompt context.",
        suggested_response:
          `Hello ${request.customerName},\n\nThank you for reaching out. We have logged your request and routed it to our specialized security and technical operations team for manual verification. A team member will review your inquiry shortly.\n\nBest regards,\nCustomer Support Operations`,
        missing_information: ["Legitimate business justification", "Authorized account identity verification"],
        potential_security_risk: true,
        security_notes:
          "CRITICAL: User input contains heuristic prompt injection markers. Automated action execution is blocked.",
      };

      return {
        output,
        provider: this.name,
        model: this.modelName,
        promptVersion: CURRENT_PROMPT_VERSION,
        latencyMs: Date.now() - startTime + 80,
      };
    }

    // 2. SERVICE OUTAGE / SYSTEM DOWN
    if (
      text.includes("outage") ||
      text.includes("down") ||
      text.includes("500") ||
      text.includes("crash") ||
      text.includes("production down") ||
      text.includes("all users affected")
    ) {
      const output: AIStructuredOutput = {
        summary: "Customer reporting critical production service unavailability or widespread HTTP 500 errors.",
        category: "service_outage",
        priority: "urgent",
        priority_reasoning:
          "Message indicates service outage impacting core workflows and potential multi-user production disruption.",
        confidence_score: 0.95,
        is_uncertain: false,
        sentiment: "frustrated",
        recommended_team: "technical_support",
        recommended_action:
          "Verify incident dashboard and escalate to Tier-3 Site Reliability Engineering on-call team.",
        suggested_response:
          `Hello ${request.customerName},\n\nWe understand the critical urgency of this situation. Our engineering and Site Reliability teams have been notified and are actively investigating the reported service degradation. We will provide updates every 30 minutes until full resolution.\n\nThank you for your patience,\nFlowPilot Technical Operations`,
        missing_information: ["Specific API endpoint or region", "Affected timestamp", "Client-side error logs"],
        potential_security_risk: false,
        security_notes: null,
      };

      return {
        output,
        provider: this.name,
        model: this.modelName,
        promptVersion: CURRENT_PROMPT_VERSION,
        latencyMs: Date.now() - startTime + 65,
      };
    }

    // 3. BILLING / REFUND
    if (
      text.includes("billing") ||
      text.includes("refund") ||
      text.includes("invoice") ||
      text.includes("charge") ||
      text.includes("credit card") ||
      text.includes("subscription")
    ) {
      const output: AIStructuredOutput = {
        summary: "Customer inquiry concerning billing discrepancy, invoice charge verification, or refund request.",
        category: "billing_refund",
        priority: text.includes("unauthorized") || text.includes("double charge") ? "high" : "medium",
        priority_reasoning:
          "Financial transaction inquiry requiring cross-referencing with payment gateway records.",
        confidence_score: 0.92,
        is_uncertain: false,
        sentiment: text.includes("wrong") || text.includes("double") ? "negative" : "neutral",
        recommended_team: "billing",
        recommended_action:
          "Cross-reference customer email and reference ID in payment processor dashboard before issuing credit or adjustment.",
        suggested_response:
          `Hello ${request.customerName},\n\nThank you for contacting billing support regarding your account. We take financial inquiries seriously. Our finance team is reviewing your invoice and transaction history. To help us process this promptly, please confirm the last 4 digits of the payment method or invoice number.\n\nWarm regards,\nFlowPilot Billing Team`,
        missing_information: request.referenceId ? [] : ["Invoice ID or Transaction Reference Number"],
        potential_security_risk: false,
        security_notes: null,
      };

      return {
        output,
        provider: this.name,
        model: this.modelName,
        promptVersion: CURRENT_PROMPT_VERSION,
        latencyMs: Date.now() - startTime + 50,
      };
    }

    // 4. AMBIGUOUS / VAGUE REQUEST
    if (
      request.message.length < 35 ||
      text.includes("not working") ||
      text.includes("help me please") ||
      text.includes("something broke")
    ) {
      const output: AIStructuredOutput = {
        summary: "Customer submitted an ambiguous or underspecified problem description requiring diagnostic clarification.",
        category: "technical_issue",
        priority: "medium",
        priority_reasoning:
          "Customer states functionality is impaired, but does not provide symptoms, error logs, or reproduction steps.",
        confidence_score: 0.58,
        is_uncertain: true,
        sentiment: "neutral",
        recommended_team: "general_support",
        recommended_action:
          "Reply with structured diagnostic questions asking for exact error message, browser, and steps to reproduce.",
        suggested_response:
          `Hello ${request.customerName},\n\nThanks for reaching out. We would love to help you get this resolved! Could you please share a bit more detail regarding what you are experiencing?\n1. What specific screen or feature are you trying to use?\n2. What error message appears, if any?\n3. What browser or device are you using?\n\nOnce we have those details, we will get right on it!\n\nBest,\nFlowPilot Support`,
        missing_information: [
          "Steps to reproduce the issue",
          "Exact error messages or screenshot",
          "Device / Browser / OS version",
        ],
        potential_security_risk: false,
        security_notes: "Model flagged low classification certainty (58%) due to brevity of user message.",
      };

      return {
        output,
        provider: this.name,
        model: this.modelName,
        promptVersion: CURRENT_PROMPT_VERSION,
        latencyMs: Date.now() - startTime + 45,
      };
    }

    // 5. ACCOUNT ACCESS / LOGIN ISSUE
    if (
      text.includes("password") ||
      text.includes("login") ||
      text.includes("locked out") ||
      text.includes("2fa") ||
      text.includes("mfa") ||
      text.includes("sso")
    ) {
      const output: AIStructuredOutput = {
        summary: "Customer reporting credential, two-factor authentication, or account access lockout.",
        category: "account_access",
        priority: text.includes("locked out") ? "high" : "medium",
        priority_reasoning:
          "Customer cannot authenticate to their account, blocking access to product services.",
        confidence_score: 0.89,
        is_uncertain: false,
        sentiment: "negative",
        recommended_team: "technical_support",
        recommended_action:
          "Send secure identity reset link after confirming identity challenge answers or email ownership.",
        suggested_response:
          `Hello ${request.customerName},\n\nWe understand how frustrating account access issues can be. For your security, we have triggered a password/2FA recovery flow to the verified email address on file. Please check your inbox for verification instructions.\n\nBest regards,\nFlowPilot Account Security`,
        missing_information: ["Verified account email confirmation"],
        potential_security_risk: false,
        security_notes: null,
      };

      return {
        output,
        provider: this.name,
        model: this.modelName,
        promptVersion: CURRENT_PROMPT_VERSION,
        latencyMs: Date.now() - startTime + 55,
      };
    }

    // 6. DEFAULT / GENERAL INQUIRY
    const output: AIStructuredOutput = {
      summary: `Customer inquiry regarding ${request.title.toLowerCase().replace(/ticket/g, "").trim() || "general product services"}.`,
      category: "general_inquiry",
      priority: "low",
      priority_reasoning: "Routine informational query without indication of system failure or business blocking.",
      confidence_score: 0.88,
      is_uncertain: false,
      sentiment: "positive",
      recommended_team: "general_support",
      recommended_action: "Provide helpful documentation links or schedule product consultation walkthrough.",
      suggested_response:
        `Hello ${request.customerName},\n\nThank you for reaching out to FlowPilot. We are delighted to help! You can find detailed guides in our knowledge base, or let us know if you would like us to walk through any specific feature together.\n\nWarm regards,\nFlowPilot Customer Success`,
      missing_information: [],
      potential_security_risk: false,
      security_notes: null,
    };

    return {
      output,
      provider: this.name,
      model: this.modelName,
      promptVersion: CURRENT_PROMPT_VERSION,
      latencyMs: Date.now() - startTime + 40,
    };
  }
}
