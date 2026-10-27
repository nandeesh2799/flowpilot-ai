import React from "react";
import { AuditEvent } from "@/lib/types";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import {
  History,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Cpu,
  FileEdit,
  Tag,
  Users,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-5 text-center text-xs text-slate-400">
        No workflow events recorded yet.
      </div>
    );
  }

  const getEventIcon = (type: string, actorType: string) => {
    if (type.includes("ai_")) return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
    if (type.includes("approved")) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    if (type.includes("rejected")) return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    if (type.includes("priority")) return <Tag className="w-3.5 h-3.5 text-amber-500" />;
    if (type.includes("team")) return <Users className="w-3.5 h-3.5 text-blue-500" />;
    if (type.includes("edited") || type.includes("note")) return <FileEdit className="w-3.5 h-3.5 text-slate-500" />;
    if (type.includes("reopened")) return <RotateCcw className="w-3.5 h-3.5 text-purple-500" />;
    return actorType === "human_reviewer" ? (
      <User className="w-3.5 h-3.5 text-slate-600" />
    ) : (
      <Cpu className="w-3.5 h-3.5 text-slate-400" />
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <span>Workflow Audit History</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          {events.length} Events Logged
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {events.map((evt) => (
          <div key={evt.id} className="relative group text-xs">
            {/* Timeline bullet icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-xs">
              {getEventIcon(evt.event_type, evt.actor_type)}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                  <span>{evt.actor_name}</span>
                  <span
                    className={cn(
                      "text-[9px] uppercase px-1.5 py-0.2 rounded font-mono border",
                      evt.actor_type === "human_reviewer"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                        : evt.actor_type === "ai_engine"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    )}
                  >
                    {evt.actor_type.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-slate-400 font-mono" title={formatDate(evt.created_at)}>
                  {formatRelativeTime(evt.created_at)}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                {evt.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
