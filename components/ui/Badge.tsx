import React from "react";
import { cn } from "@/lib/utils";
import { TicketPriority, TicketStatus, SupportTeam } from "@/lib/types";

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, { bg: string; text: string; border: string; label: string }> = {
    urgent: {
      bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-500/30",
      label: "Urgent",
    },
    high: {
      bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-500/30",
      label: "High",
    },
    medium: {
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
      label: "Medium",
    },
    low: {
      bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-500/30",
      label: "Low",
    },
  };

  const style = styles[priority] || styles.medium;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        style.bg
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          priority === "urgent"
            ? "bg-red-500 animate-pulse"
            : priority === "high"
            ? "bg-orange-500"
            : priority === "medium"
            ? "bg-amber-500"
            : "bg-slate-400"
        )}
      />
      {style.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, { bg: string; label: string }> = {
    new: { bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", label: "New" },
    triaged: { bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", label: "AI Triaged" },
    in_progress: { bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", label: "In Progress" },
    waiting_on_customer: { bg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", label: "Waiting on Customer" },
    resolved: { bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", label: "Resolved" },
    closed: { bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20", label: "Closed" },
  };

  const s = styles[status] || styles.new;

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", s.bg)}>
      {s.label}
    </span>
  );
}

export function TeamBadge({ team }: { team: SupportTeam }) {
  const teamLabels: Record<SupportTeam, string> = {
    general_support: "General Support",
    technical_support: "Tech Support",
    billing: "Billing & Finance",
    security_compliance: "Security & Compliance",
    executive_escalations: "VIP Escalations",
    unassigned: "Unassigned",
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      {teamLabels[team] || team}
    </span>
  );
}
