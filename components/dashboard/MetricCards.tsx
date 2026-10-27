import React from "react";
import { DashboardMetrics } from "@/lib/types";
import {
  Inbox,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export function MetricCards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      title: "Total Tickets",
      value: metrics.total_tickets,
      description: "All ingested customer inquiries",
      icon: Inbox,
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-950/50",
    },
    {
      title: "Active Triage & In Progress",
      value: metrics.open_and_in_progress,
      description: "Awaiting review or work",
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      title: "Urgent & High Priority",
      value: metrics.urgent_and_high_priority,
      description: "Requiring immediate escalation",
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/50",
    },
    {
      title: "Resolved Tickets",
      value: metrics.resolved_tickets,
      description: "Successfully processed cases",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "AI Triage Confidence",
      value: `${Math.round(metrics.average_confidence * 100)}%`,
      description: `Across ${metrics.total_tickets} analyses`,
      icon: Sparkles,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
