import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from "./provider";
import { GeminiAIProvider } from "./gemini-provider";
import { DeterministicDemoProvider } from "./demo-provider";
import { repository } from "../db";
import { AIAnalysis, Ticket } from "../types";

export class AIService {
  private liveProvider: AIProvider | null = null;
  private demoProvider: DeterministicDemoProvider;

  constructor() {
    this.demoProvider = new DeterministicDemoProvider();
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== "") {
      try {
        this.liveProvider = new GeminiAIProvider(apiKey);
      } catch (err) {
        console.warn("Failed to initialize GeminiAIProvider, using demo fallback:", err);
      }
    }
  }

  public getActiveProvider(forceDemo = false): AIProvider {
    if (forceDemo || process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !this.liveProvider) {
      return this.demoProvider;
    }
    return this.liveProvider;
  }

  public getProviderStatus() {
    const hasKey = !!process.env.GEMINI_API_KEY;
    const isForcedDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    return {
      activeProvider: isForcedDemo || !hasKey ? "demo_fallback" : "live_gemini",
      modelName: isForcedDemo || !hasKey ? "demo-rules-v1" : (process.env.GEMINI_MODEL || "gemini-1.5-flash"),
      hasKey,
      isForcedDemo,
    };
  }

  /**
   * Run AI analysis on a ticket, persisting the outcome and audit events.
   * Never throws uncaught errors that destroy the ticket.
   */
  async processTicketAnalysis(
    ticket: Ticket,
    options?: { forceDemo?: boolean; isRetry?: boolean }
  ): Promise<{ success: boolean; analysis?: AIAnalysis; error?: string }> {
    const provider = this.getActiveProvider(options?.forceDemo);

    // Record request audit event
    await repository.createAuditEvent({
      ticket_id: ticket.id,
      event_type: options?.isRetry ? "ai_retry_requested" : "ai_analysis_requested",
      actor_type: "system",
      actor_name: "FlowPilot Orchestrator",
      summary: `AI triage analysis requested via ${provider.name} (${provider.modelName})`,
      metadata: { provider: provider.name, model: provider.modelName, isRetry: !!options?.isRetry },
    });

    const request: AIAnalysisRequest = {
      ticketId: ticket.id,
      title: ticket.title,
      message: ticket.message,
      customerName: ticket.customer_name,
      customerEmail: ticket.customer_email,
      channel: ticket.channel,
      referenceId: ticket.reference_id,
      customerContext: ticket.customer_context,
    };

    let result: AIAnalysisResult | null = null;
    let failureReason: string | null = null;

    // Execute with up to 1 retry on live provider transient failure
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await provider.analyzeTicket(request);
        break; // Success
      } catch (err: unknown) {
        failureReason = err instanceof Error ? err.message : String(err);
        console.warn(`AI Analysis attempt ${attempt} failed: ${failureReason}`);
        if (attempt === 1 && provider.name === "google-gemini") {
          // brief pause before single retry
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }

    if (result) {
      // 1. Persist successful analysis
      const savedAnalysis = await repository.createAIAnalysis({
        ticket_id: ticket.id,
        provider: result.provider,
        model: result.model,
        prompt_version: result.promptVersion,
        status: "success",
        error_message: null,
        summary: result.output.summary,
        category: result.output.category,
        priority: result.output.priority,
        priority_reasoning: result.output.priority_reasoning,
        confidence_score: result.output.confidence_score,
        is_uncertain: result.output.is_uncertain,
        sentiment: result.output.sentiment,
        recommended_team: result.output.recommended_team,
        recommended_action: result.output.recommended_action,
        suggested_response: result.output.suggested_response,
        missing_information: result.output.missing_information,
        potential_security_risk: result.output.potential_security_risk,
        security_notes: result.output.security_notes,
        latency_ms: result.latencyMs,
      });

      // 2. Automatically sync ticket priority and recommended team if ticket is still new
      if (ticket.status === "new") {
        await repository.updateTicket(ticket.id, {
          priority: result.output.priority,
          assigned_team: result.output.recommended_team,
          status: "triaged",
        });
      }

      // 3. Record completion audit event
      await repository.createAuditEvent({
        ticket_id: ticket.id,
        event_type: "ai_analysis_completed",
        actor_type: "ai_engine",
        actor_name: `${result.provider} (${result.model})`,
        summary: `Triage complete: ${result.output.category} | Priority: ${result.output.priority} | Team: ${result.output.recommended_team} | Confidence: ${Math.round(result.output.confidence_score * 100)}%`,
        metadata: {
          category: result.output.category,
          priority: result.output.priority,
          confidence_score: result.output.confidence_score,
          potential_security_risk: result.output.potential_security_risk,
          latency_ms: result.latencyMs,
        },
      });

      return { success: true, analysis: savedAnalysis };
    } else {
      // AI failed: Persist failed analysis attempt so ticket is NOT lost
      const failedAnalysis = await repository.createAIAnalysis({
        ticket_id: ticket.id,
        provider: provider.name,
        model: provider.modelName,
        prompt_version: "v1.2.0",
        status: "failed",
        error_message: failureReason || "Analysis failed due to model service unavailability",
        summary: "Automated analysis was unable to complete. Ticket awaits manual human triage.",
        category: "general_inquiry",
        priority: ticket.priority || "medium",
        priority_reasoning: "Analysis failed; retained original priority.",
        confidence_score: 0.0,
        is_uncertain: true,
        sentiment: "neutral",
        recommended_team: "general_support",
        recommended_action: "Perform manual review or click 'Retry AI Analysis'.",
        suggested_response:
          `Hello ${ticket.customer_name},\n\nThank you for reaching out. A support representative will review your request shortly.\n\nBest regards,\nCustomer Support`,
        missing_information: [],
        potential_security_risk: false,
        security_notes: failureReason,
        latency_ms: 0,
      });

      // Record failure audit event
      await repository.createAuditEvent({
        ticket_id: ticket.id,
        event_type: "ai_analysis_failed",
        actor_type: "system",
        actor_name: "FlowPilot Orchestrator",
        summary: `AI triage failed: ${failureReason || "Timeout/Unavailable"}. Ticket preserved for manual triage.`,
        metadata: { error: failureReason },
      });

      return {
        success: false,
        analysis: failedAnalysis,
        error: failureReason || "AI triage service unavailable",
      };
    }
  }
}

export const aiService = new AIService();
