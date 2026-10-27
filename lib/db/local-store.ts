import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  Ticket,
  AIAnalysis,
  ReviewDecision,
  AuditEvent,
  TicketWithDetails,
  DashboardMetrics,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  SupportTeam,
} from "../types";
import { InboxQueryInput } from "../validation";

interface StoreData {
  tickets: Ticket[];
  ai_analyses: AIAnalysis[];
  review_decisions: ReviewDecision[];
  audit_events: AuditEvent[];
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_FILE = path.resolve(DATA_DIR, "flowpilot_store.json");

class LocalDataStore {
  private data: StoreData = {
    tickets: [],
    ai_analyses: [],
    review_decisions: [],
    audit_events: [],
  };
  private isLoaded = false;

  constructor() {
    this.load();
  }

  private load(): void {
    if (this.isLoaded) return;
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, "utf-8");
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not read local store file, initializing in-memory:", err);
    }
    this.isLoaded = true;
  }

  private save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not write to local store file:", err);
    }
  }

  // --- TICKETS ---

  public createTicket(
    ticket: Omit<Ticket, "id" | "created_at" | "updated_at">
  ): Ticket {
    this.load();
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      ...ticket,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    this.data.tickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  public getTicketById(id: string): TicketWithDetails | null {
    this.load();
    const ticket = this.data.tickets.find((t) => t.id === id);
    if (!ticket) return null;

    const analyses = this.data.ai_analyses
      .filter((a) => a.ticket_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const review_decisions = this.data.review_decisions
      .filter((r) => r.ticket_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const audit_events = this.data.audit_events
      .filter((e) => e.ticket_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      ...ticket,
      latest_analysis: analyses[0] || null,
      analyses,
      review_decisions,
      audit_events,
    };
  }

  public listTickets(query: InboxQueryInput): {
    tickets: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } {
    this.load();
    let result = [...this.data.tickets];

    // Search
    if (query.search && query.search.trim() !== "") {
      const q = query.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.customer_name.toLowerCase().includes(q) ||
          t.message.toLowerCase().includes(q) ||
          (t.reference_id && t.reference_id.toLowerCase().includes(q)) ||
          t.id.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (query.status && query.status !== "all") {
      result = result.filter((t) => t.status === query.status);
    }

    // Priority filter
    if (query.priority && query.priority !== "all") {
      result = result.filter((t) => t.priority === query.priority);
    }

    // Category filter
    if (query.category && query.category !== "all") {
      result = result.filter((t) => {
        const latestAnalysis = this.data.ai_analyses
          .filter((a) => a.ticket_id === t.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        return latestAnalysis?.category === query.category;
      });
    }

    // Team filter
    if (query.team && query.team !== "all") {
      result = result.filter((t) => t.assigned_team === query.team);
    }

    // Sorting
    const priorityWeights: Record<TicketPriority, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    result.sort((a, b) => {
      let comparison = 0;
      if (query.sort_by === "priority") {
        comparison = priorityWeights[a.priority] - priorityWeights[b.priority];
      } else if (query.sort_by === "updated_at") {
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      } else {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return query.sort_order === "asc" ? comparison : -comparison;
    });

    const total = result.length;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedTickets = result.slice(offset, offset + limit);

    return {
      tickets: paginatedTickets,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public updateTicket(id: string, updates: Partial<Ticket>): Ticket | null {
    this.load();
    const idx = this.data.tickets.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const updated: Ticket = {
      ...this.data.tickets[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.data.tickets[idx] = updated;
    this.save();
    return updated;
  }

  // --- AI ANALYSES ---

  public createAIAnalysis(
    analysis: Omit<AIAnalysis, "id" | "created_at">
  ): AIAnalysis {
    this.load();
    const newAnalysis: AIAnalysis = {
      ...analysis,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.data.ai_analyses.unshift(newAnalysis);
    this.save();
    return newAnalysis;
  }

  public getLatestAnalysisForTicket(ticketId: string): AIAnalysis | null {
    this.load();
    const found = this.data.ai_analyses
      .filter((a) => a.ticket_id === ticketId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return found[0] || null;
  }

  // --- REVIEW DECISIONS ---

  public createReviewDecision(
    decision: Omit<ReviewDecision, "id" | "created_at">
  ): ReviewDecision {
    this.load();
    const newDecision: ReviewDecision = {
      ...decision,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.data.review_decisions.unshift(newDecision);
    this.save();
    return newDecision;
  }

  // --- AUDIT EVENTS ---

  public createAuditEvent(
    event: Omit<AuditEvent, "id" | "created_at">
  ): AuditEvent {
    this.load();
    const newEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.data.audit_events.unshift(newEvent);
    this.save();
    return newEvent;
  }

  // --- DASHBOARD METRICS ---

  public getDashboardMetrics(): DashboardMetrics {
    this.load();
    const tickets = this.data.tickets;
    const total_tickets = tickets.length;

    const open_and_in_progress = tickets.filter(
      (t) => t.status === "new" || t.status === "triaged" || t.status === "in_progress"
    ).length;

    const urgent_and_high_priority = tickets.filter(
      (t) => t.priority === "urgent" || t.priority === "high"
    ).length;

    const resolved_tickets = tickets.filter(
      (t) => t.status === "resolved" || t.status === "closed"
    ).length;

    const priority_distribution = {
      urgent: tickets.filter((t) => t.priority === "urgent").length,
      high: tickets.filter((t) => t.priority === "high").length,
      medium: tickets.filter((t) => t.priority === "medium").length,
      low: tickets.filter((t) => t.priority === "low").length,
    };

    const category_distribution: Record<TicketCategory, number> = {
      account_access: 0,
      billing_refund: 0,
      technical_issue: 0,
      feature_request: 0,
      service_outage: 0,
      security_incident: 0,
      general_inquiry: 0,
    };

    for (const ticket of tickets) {
      const latest = this.getLatestAnalysisForTicket(ticket.id);
      if (latest && latest.category in category_distribution) {
        category_distribution[latest.category]++;
      }
    }

    const status_distribution: Record<TicketStatus, number> = {
      new: tickets.filter((t) => t.status === "new").length,
      triaged: tickets.filter((t) => t.status === "triaged").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      waiting_on_customer: tickets.filter((t) => t.status === "waiting_on_customer").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    };

    const analyses = this.data.ai_analyses;
    const successfulAnalyses = analyses.filter((a) => a.status === "success");
    const ai_success_rate =
      analyses.length > 0 ? (successfulAnalyses.length / analyses.length) * 100 : 100;

    const avgConfidence =
      successfulAnalyses.length > 0
        ? successfulAnalyses.reduce((acc, curr) => acc + curr.confidence_score, 0) /
          successfulAnalyses.length
        : 0.92;

    const recent_tickets = [...tickets]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const hasApiKey = !!process.env.GEMINI_API_KEY;

    return {
      total_tickets,
      open_and_in_progress,
      urgent_and_high_priority,
      resolved_tickets,
      priority_distribution,
      category_distribution,
      status_distribution,
      ai_success_rate: Math.round(ai_success_rate),
      average_confidence: parseFloat(avgConfidence.toFixed(2)),
      recent_tickets,
      system_status: {
        database: "demo_local",
        ai_provider: hasApiKey ? "live_gemini" : "demo_fallback",
        model_name: hasApiKey ? (process.env.GEMINI_MODEL || "gemini-1.5-flash") : "demo-rules-v1",
      },
    };
  }

  // --- SEED / RESET ---

  public seed(data: StoreData): void {
    this.data = data;
    this.isLoaded = true;
    this.save();
  }

  public clear(): void {
    this.data = {
      tickets: [],
      ai_analyses: [],
      review_decisions: [],
      audit_events: [],
    };
    this.save();
  }
}

// Singleton local data store
export const localStore = new LocalDataStore();
