import React from "react";
import Link from "next/link";
import { Ticket } from "@/lib/types";
import { PriorityBadge, StatusBadge, TeamBadge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function RecentTicketsTable({ tickets }: { tickets: Ticket[] }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        No recent tickets found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <th className="py-3 px-4">Ticket</th>
            <th className="py-3 px-4">Customer</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Assigned Team</th>
            <th className="py-3 px-4">Created</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {tickets.map((t) => (
            <tr
              key={t.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <td className="py-3 px-4 max-w-xs">
                <Link
                  href={`/tickets/${t.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1.5 truncate"
                >
                  <span className="truncate">{t.title}</span>
                  {t.is_demo && (
                    <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      demo
                    </span>
                  )}
                </Link>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  ID: {t.id.slice(0, 8)}... {t.reference_id && `• Ref: ${t.reference_id}`}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {t.customer_name}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  {t.customer_email || t.channel}
                </div>
              </td>
              <td className="py-3 px-4">
                <PriorityBadge priority={t.priority} />
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={t.status} />
              </td>
              <td className="py-3 px-4">
                <TeamBadge team={t.assigned_team} />
              </td>
              <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                {formatRelativeTime(t.created_at)}
              </td>
              <td className="py-3 px-4 text-right">
                <Link
                  href={`/tickets/${t.id}`}
                  className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  <span>Review</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
