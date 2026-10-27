"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  PlusCircle,
  FileCode2,
  ShieldCheck,
  Cpu,
  Workflow,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Ticket Inbox", href: "/tickets", icon: Inbox },
    { name: "Create Ticket", href: "/tickets/new", icon: PlusCircle },
    { name: "Documentation", href: "/docs", icon: FileCode2 },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
          <Workflow className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            FlowPilot <span className="text-brand-600 dark:text-brand-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">AI</span>
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">Support Workflow Copilot</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Assessment Badge & Info */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Gokul Infocare Assessment</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          AI Growth & Automation Associate Practical Project (Technology Domain / Automation).
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700">
          <span>Human-in-the-loop</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">Safe Mode</span>
        </div>
      </div>
    </aside>
  );
}
