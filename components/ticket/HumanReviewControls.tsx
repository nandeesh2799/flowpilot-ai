"use client";

import React, { useState } from "react";
import { TicketWithDetails, TicketPriority, TicketStatus, SupportTeam } from "@/lib/types";
import {
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Users,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
} from "lucide-react";

interface HumanReviewControlsProps {
  ticket: TicketWithDetails;
  onUpdatePriority: (priority: TicketPriority) => void;
  onUpdateTeam: (team: SupportTeam) => void;
  onUpdateStatus: (status: TicketStatus) => void;
  onResolveTicket: () => void;
  onReopenTicket: () => void;
  onRetryAI: () => void;
  onAddNote: (note: string) => void;
  isProcessing: boolean;
}

export function HumanReviewControls({
  ticket,
  onUpdatePriority,
  onUpdateTeam,
  onUpdateStatus,
  onResolveTicket,
  onReopenTicket,
  onRetryAI,
  onAddNote,
  isProcessing,
}: HumanReviewControlsProps) {
  const [note, setNote] = useState("");
  const [reviewerName, setReviewerName] = useState("Support Agent");

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onAddNote(note.trim());
    setNote("");
  };

  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Human Review &amp; Ticket Actions</span>
        </h3>
        <button
          onClick={onRetryAI}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Retry AI Analysis</span>
        </button>
      </div>

      {/* Dropdown controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Change Priority */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Override Priority
          </label>
          <select
            value={ticket.priority}
            onChange={(e) => onUpdatePriority(e.target.value as TicketPriority)}
            disabled={isProcessing}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Reassign Team */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Reassign Team
          </label>
          <select
            value={ticket.assigned_team}
            onChange={(e) => onUpdateTeam(e.target.value as SupportTeam)}
            disabled={isProcessing}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="general_support">General Support</option>
            <option value="technical_support">Technical Support</option>
            <option value="billing">Billing &amp; Finance</option>
            <option value="security_compliance">Security &amp; Compliance</option>
            <option value="executive_escalations">VIP Escalations</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>

        {/* Change Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Update Workflow Status
          </label>
          <select
            value={ticket.status}
            onChange={(e) => onUpdateStatus(e.target.value as TicketStatus)}
            disabled={isProcessing}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="new">New</option>
            <option value="triaged">AI Triaged</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_on_customer">Waiting on Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Resolve / Reopen primary action */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs text-slate-500">
          Current State: <span className="font-semibold uppercase">{ticket.status}</span>
        </div>
        <div>
          {isResolved ? (
            <button
              onClick={onReopenTicket}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen Ticket</span>
            </button>
          ) : (
            <button
              onClick={onResolveTicket}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark as Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* Internal Note Form */}
      <form onSubmit={handleNoteSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Add Reviewer Internal Note
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document investigation steps, cross-team approvals, or context..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!note.trim() || isProcessing}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-50 transition"
          >
            Add Note
          </button>
        </div>
      </form>
    </div>
  );
}
