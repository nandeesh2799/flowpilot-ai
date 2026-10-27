"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Database,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemHealth {
  ai_provider: {
    active: string;
    model: string;
    has_gemini_key: boolean;
    is_forced_demo: boolean;
  };
  database: {
    type: string;
    status: string;
  };
}

export function TopNav() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      // offline or loading
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    setSeedNotice(null);
    try {
      const res = await fetch("/api/demo/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSeedNotice("Demo data seeded!");
        setTimeout(() => {
          setSeedNotice(null);
          window.location.reload();
        }, 1200);
      } else {
        setSeedNotice("Failed to seed: " + data.error);
      }
    } catch (err: unknown) {
      setSeedNotice("Network error while seeding");
    } finally {
      setIsSeeding(false);
    }
  };

  const isLiveAI = health?.ai_provider.active === "live_gemini";
  const isSupabase = health?.database.type === "supabase_postgresql";

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: System Status Pills */}
      <div className="flex items-center gap-2.5 text-xs">
        {/* AI Provider Status Pill */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors",
            isLiveAI
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
          )}
          title={
            isLiveAI
              ? "Connected to Google Gemini API"
              : "Running in deterministic local demo fallback (No external API key needed)"
          }
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">
            AI: {isLiveAI ? health?.ai_provider.model : "Demo Mode (Offline Fallback)"}
          </span>
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isLiveAI ? "bg-emerald-500 animate-pulse" : "bg-indigo-500"
            )}
          />
        </div>

        {/* Persistence Status Pill */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          title={isSupabase ? "Persisted in Supabase PostgreSQL" : "Persisted in Local Relational JSON Store"}
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium">
            DB: {isSupabase ? "Supabase Postgres" : "Local Relational Store"}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {seedNotice && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
            {seedNotice}
          </span>
        )}

        <button
          onClick={handleSeedDemo}
          disabled={isSeeding}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 disabled:opacity-50"
          title="Reset and reload realistic fictional sample tickets"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isSeeding && "animate-spin")} />
          <span>{isSeeding ? "Seeding..." : "Load Sample Tickets"}</span>
        </button>

        <Link
          href="/tickets/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Ticket</span>
        </Link>
      </div>
    </header>
  );
}
