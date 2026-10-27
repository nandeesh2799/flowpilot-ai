import React from "react";
import { DashboardMetrics } from "@/lib/types";

export function PriorityChart({ metrics }: { metrics: DashboardMetrics }) {
  const { priority_distribution, total_tickets } = metrics;

  if (total_tickets === 0) {
    return (
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No priority data available
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Create a ticket or click &quot;Load Sample Tickets&quot; to populate real records.
        </p>
      </div>
    );
  }

  const items = [
    {
      label: "Urgent",
      count: priority_distribution.urgent,
      pct: Math.round((priority_distribution.urgent / total_tickets) * 100),
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "High",
      count: priority_distribution.high,
      pct: Math.round((priority_distribution.high / total_tickets) * 100),
      color: "bg-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Medium",
      count: priority_distribution.medium,
      pct: Math.round((priority_distribution.medium / total_tickets) * 100),
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Low",
      count: priority_distribution.low,
      pct: Math.round((priority_distribution.low / total_tickets) * 100),
      color: "bg-slate-400",
      textColor: "text-slate-600 dark:text-slate-400",
    },
  ];

  return (
    <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Priority Distribution
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {total_tickets} Total Records
          </span>
        </div>

        {/* Proportional Stacked Bar */}
        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden mb-5">
          {items.map((item) => (
            item.count > 0 && (
              <div
                key={item.label}
                className={`${item.color} transition-all duration-500`}
                style={{ width: `${item.pct}%` }}
                title={`${item.label}: ${item.count} (${item.pct}%)`}
              />
            )
          ))}
        </div>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.count}
              </span>
              <span className="text-slate-400 w-8 text-right">
                {item.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
