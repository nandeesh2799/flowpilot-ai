import React from "react";
import { DashboardMetrics, TicketCategory } from "@/lib/types";

export function CategoryBreakdown({ metrics }: { metrics: DashboardMetrics }) {
  const { category_distribution, total_tickets } = metrics;

  const categoryLabels: Record<TicketCategory, string> = {
    account_access: "Account & Login",
    billing_refund: "Billing & Refunds",
    technical_issue: "Technical Issues",
    service_outage: "Service Outages",
    feature_request: "Feature Requests",
    security_incident: "Security & Compliance",
    general_inquiry: "General Inquiries",
  };

  const categories = Object.keys(category_distribution) as TicketCategory[];
  const hasData = total_tickets > 0 && categories.some((c) => category_distribution[c] > 0);

  if (!hasData) {
    return (
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No category classification data
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Tickets triaged by FlowPilot AI will populate category metrics.
        </p>
      </div>
    );
  }

  // Find max count for relative bar scaling
  const maxCount = Math.max(...categories.map((c) => category_distribution[c]), 1);

  return (
    <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Category Distribution
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          AI Triage Breakdown
        </span>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const count = category_distribution[cat] || 0;
          const pct = Math.round((count / (total_tickets || 1)) * 100);
          const barWidth = Math.round((count / maxCount) * 100);

          return (
            <div key={cat} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {categoryLabels[cat]}
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
