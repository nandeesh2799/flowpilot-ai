"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { TicketWithDetails, TicketPriority, TicketStatus, SupportTeam } from "@/lib/types";
import { AIAnalysisPanel } from "@/components/ticket/AIAnalysisPanel";
import { HumanReviewControls } from "@/components/ticket/HumanReviewControls";
import { AuditTimeline } from "@/components/ticket/AuditTimeline";
import { PriorityBadge, StatusBadge, TeamBadge } from "@/components/ui/Badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  User,
  Clock,
  Hash,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error("Ticket not found");
      const data = await res.json();
      setTicket(data);
    } catch (err: unknown) {
      console.error("Error fetching ticket:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleReviewAction = async (payload: Record<string, unknown>) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tickets/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setTicket(data.ticket);
      showNotification("success", data.message || "Action updated successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      showNotification("error", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading ticket record and AI analysis...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Ticket Not Found
        </h3>
        <p className="text-xs text-slate-500">
          The requested ticket does not exist or was deleted.
        </p>
        <Link
          href="/tickets"
          className="inline-block text-xs font-semibold text-brand-600 underline"
        >
          Return to Inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back and Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 mb-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inbox</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {ticket.title}
            </h1>
            {ticket.is_demo && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Sample
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
            <span>Ticket ID: {ticket.id}</span>
            {ticket.reference_id && <span>• Ref: {ticket.reference_id}</span>}
            <span>• Created: {formatDate(ticket.created_at)}</span>
          </div>
        </div>

        {/* Current status & priority badges */}
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
          <TeamBadge team={ticket.assigned_team} />
        </div>
      </div>

      {/* Notification Toast */}
      {notice && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            notice.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Two Column Layout: Left = Ticket Message & Context, Right = AI Copilot & Review Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Message & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Customer Metadata Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Name:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ticket.customer_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {ticket.customer_email || "Not provided"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="uppercase font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {ticket.channel}
                </span>
              </div>
              {ticket.reference_id && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Reference:
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {ticket.reference_id}
                  </span>
                </div>
              )}
            </div>

            {ticket.customer_context && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Customer Context:
                </span>
                <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded text-[11px] leading-relaxed">
                  {ticket.customer_context}
                </p>
              </div>
            )}
          </div>

          {/* Customer Message Body Card */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Message
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {ticket.message.length} chars
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans select-text">
              {ticket.message}
            </div>
          </div>

          {/* Chronological Audit Timeline */}
          <AuditTimeline events={ticket.audit_events} />
        </div>

        {/* Right Column: AI Copilot Analysis & Human Review Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Analysis Panel */}
          <AIAnalysisPanel
            analysis={ticket.latest_analysis || null}
            onApproveResponse={(response) =>
              handleReviewAction({
                action: "approve_suggested_reply",
                edited_response: response,
                reviewer_name: "Support Agent",
              })
            }
            onRejectResponse={(reason) =>
              handleReviewAction({
                action: "reject_suggested_reply",
                rejection_reason: reason,
                reviewer_name: "Support Agent",
              })
            }
            isProcessing={isProcessing}
          />

          {/* Human Review & State Controls */}
          <HumanReviewControls
            ticket={ticket}
            onUpdatePriority={(priority) =>
              handleReviewAction({
                action: "change_priority",
                new_priority: priority,
                reviewer_name: "Support Agent",
              })
            }
            onUpdateTeam={(team) =>
              handleReviewAction({
                action: "reassign_team",
                new_team: team,
                reviewer_name: "Support Agent",
              })
            }
            onUpdateStatus={(status) =>
              handleReviewAction({
                action: "change_status",
                new_status: status,
                reviewer_name: "Support Agent",
              })
            }
            onResolveTicket={() =>
              handleReviewAction({
                action: "resolve_ticket",
                reviewer_name: "Support Agent",
              })
            }
            onReopenTicket={() =>
              handleReviewAction({
                action: "reopen_ticket",
                reviewer_name: "Support Agent",
              })
            }
            onRetryAI={() =>
              handleReviewAction({
                action: "retry_ai_analysis",
                reviewer_name: "Support Agent",
              })
            }
            onAddNote={(note) =>
              handleReviewAction({
                action: "add_internal_note",
                note,
                reviewer_name: "Support Agent",
              })
            }
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
