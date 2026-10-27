import {
  Ticket,
  AIAnalysis,
  ReviewDecision,
  AuditEvent,
  TicketWithDetails,
  DashboardMetrics,
} from "../types";
import { InboxQueryInput } from "../validation";
import { localStore } from "./local-store";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface TicketRepository {
  createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket>;
  getTicketById(id: string): Promise<TicketWithDetails | null>;
  listTickets(query: InboxQueryInput): Promise<{
    tickets: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null>;
  createAIAnalysis(analysis: Omit<AIAnalysis, "id" | "created_at">): Promise<AIAnalysis>;
  getLatestAnalysisForTicket(ticketId: string): Promise<AIAnalysis | null>;
  createReviewDecision(decision: Omit<ReviewDecision, "id" | "created_at">): Promise<ReviewDecision>;
  createAuditEvent(event: Omit<AuditEvent, "id" | "created_at">): Promise<AuditEvent>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
  isSupabaseConfigured(): boolean;
}

class HybridRepository implements TicketRepository {
  private supabase: SupabaseClient | null = null;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
      } catch (err) {
        console.warn("Failed to initialize Supabase client, falling back to local store:", err);
        this.supabase = null;
      }
    }
  }

  public isSupabaseConfigured(): boolean {
    return this.supabase !== null;
  }

  async createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from("tickets")
          .insert([ticket])
          .select()
          .single();
        if (error) throw error;
        return data as Ticket;
      } catch (err) {
        console.warn("Supabase createTicket error, falling back to local:", err);
      }
    }
    return localStore.createTicket(ticket);
  }

  async getTicketById(id: string): Promise<TicketWithDetails | null> {
    if (this.supabase) {
      try {
        const { data: ticket, error: ticketError } = await this.supabase
          .from("tickets")
          .select("*")
          .eq("id", id)
          .single();
        if (ticketError || !ticket) return null;

        const { data: analyses } = await this.supabase
          .from("ai_analyses")
          .select("*")
          .eq("ticket_id", id)
          .order("created_at", { ascending: false });

        const { data: reviews } = await this.supabase
          .from("review_decisions")
          .select("*")
          .eq("ticket_id", id)
          .order("created_at", { ascending: false });

        const { data: audits } = await this.supabase
          .from("audit_events")
          .select("*")
          .eq("ticket_id", id)
          .order("created_at", { ascending: false });

        const analysesList = (analyses || []) as AIAnalysis[];
        return {
          ...(ticket as Ticket),
          latest_analysis: analysesList[0] || null,
          analyses: analysesList,
          review_decisions: (reviews || []) as ReviewDecision[],
          audit_events: (audits || []) as AuditEvent[],
        };
      } catch (err) {
        console.warn("Supabase getTicketById error, falling back to local:", err);
      }
    }
    return localStore.getTicketById(id);
  }

  async listTickets(query: InboxQueryInput) {
    if (this.supabase) {
      try {
        let q = this.supabase.from("tickets").select("*", { count: "exact" });

        if (query.status && query.status !== "all") {
          q = q.eq("status", query.status);
        }
        if (query.priority && query.priority !== "all") {
          q = q.eq("priority", query.priority);
        }
        if (query.team && query.team !== "all") {
          q = q.eq("assigned_team", query.team);
        }
        if (query.search && query.search.trim() !== "") {
          q = q.ilike("title", `%${query.search.trim()}%`);
        }

        const ascending = query.sort_order === "asc";
        q = q.order(query.sort_by, { ascending });

        const page = query.page || 1;
        const limit = query.limit || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        q = q.range(from, to);

        const { data, count, error } = await q;
        if (!error && data) {
          const total = count || 0;
          return {
            tickets: data as Ticket[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          };
        }
      } catch (err) {
        console.warn("Supabase listTickets error, falling back to local:", err);
      }
    }
    return localStore.listTickets(query);
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from("tickets")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return data as Ticket;
      } catch (err) {
        console.warn("Supabase updateTicket error, falling back to local:", err);
      }
    }
    return localStore.updateTicket(id, updates);
  }

  async createAIAnalysis(analysis: Omit<AIAnalysis, "id" | "created_at">): Promise<AIAnalysis> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from("ai_analyses")
          .insert([analysis])
          .select()
          .single();
        if (!error && data) return data as AIAnalysis;
      } catch (err) {
        console.warn("Supabase createAIAnalysis error, falling back to local:", err);
      }
    }
    return localStore.createAIAnalysis(analysis);
  }

  async getLatestAnalysisForTicket(ticketId: string): Promise<AIAnalysis | null> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from("ai_analyses")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) return data as AIAnalysis;
      } catch (err) {
        console.warn("Supabase getLatestAnalysis error, falling back to local:", err);
      }
    }
    return localStore.getLatestAnalysisForTicket(ticketId);
  }

  async createReviewDecision(
    decision: Omit<ReviewDecision, "id" | "created_at">
  ): Promise<ReviewDecision> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from("review_decisions")
          .insert([decision])
          .select()
          .single();
        if (!error && data) return data as ReviewDecision;
      } catch (err) {
        console.warn("Supabase createReviewDecision error, falling back to local:", err);
      }
    }
    return localStore.createReviewDecision(decision);
  }

  async createAuditEvent(event: Omit<AuditEvent, "id" | "created_at">): Promise<AuditEvent> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from("audit_events")
          .insert([event])
          .select()
          .single();
        if (!error && data) return data as AuditEvent;
      } catch (err) {
        console.warn("Supabase createAuditEvent error, falling back to local:", err);
      }
    }
    return localStore.createAuditEvent(event);
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const metrics = localStore.getDashboardMetrics();
    if (this.supabase) {
      metrics.system_status.database = "connected";
    }
    return metrics;
  }
}

export const repository = new HybridRepository();
