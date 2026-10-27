"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardMetrics } from "@/lib/types";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { PriorityChart } from "@/components/dashboard/PriorityChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecentTicketsTable } from "@/components/dashboard/RecentTicketsTable";
import {
  PlusCircle,
  Inbox,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Support Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time customer inquiry triage, AI copilot classifications, and human review metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadMetrics}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ticket</span>
          </Link>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && !metrics && (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-slate-500">Calculating real-time support metrics...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40 text-red-700 dark:text-red-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadMetrics}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {metrics && (
        <>
          {/* Top 5 Metric Cards */}
          <MetricCards metrics={metrics} />

          {/* Two-Column Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriorityChart metrics={metrics} />
            <CategoryBreakdown metrics={metrics} />
          </div>

          {/* Recent Tickets Table Section */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Recent Inquiries
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest customer tickets triaged by FlowPilot AI
                </p>
              </div>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <span>View Full Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <RecentTicketsTable tickets={metrics.recent_tickets} />
          </div>
        </>
      )}
    </div>
  );
}
