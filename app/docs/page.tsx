"use client";

import React, { useState } from "react";
import {
  FileText,
  Workflow,
  Sparkles,
  CheckCircle,
  Video,
  Terminal,
  ShieldCheck,
} from "lucide-react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<
    "architecture" | "prompts" | "testing" | "script" | "checklist"
  >("architecture");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Documentation &amp; Assessment Artifacts
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete engineering architecture, genuine prompt development log, test execution report, video script, and submission checklist for Gokul Infocare Assessment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("architecture")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === "architecture"
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>Architecture &amp; Data Flow</span>
        </button>

        <button
          onClick={() => setActiveTab("prompts")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === "prompts"
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prompt Engineering Log</span>
        </button>

        <button
          onClick={() => setActiveTab("testing")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === "testing"
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Testing Report</span>
        </button>

        <button
          onClick={() => setActiveTab("script")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === "script"
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Video Presentation Script</span>
        </button>

        <button
          onClick={() => setActiveTab("checklist")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === "checklist"
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Submission Checklist</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm leading-relaxed text-xs space-y-4">
        {activeTab === "architecture" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              FlowPilot AI System Architecture
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              FlowPilot AI is an enterprise support automation copilot built to triage incoming customer inquiries, classify priority and sentiment, detect prompt injection threats, generate grounded suggested responses, and enforce a safe human-in-the-loop review workflow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  1. Client &amp; Presentation Layer
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Next.js App Router (React 19, TypeScript), Tailwind CSS, Lucide icons. Responsive layout with metrics dashboard, filterable inbox, structured AI analysis cards, and an immutable audit event timeline.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  2. AI Provider Boundary
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Clean <code>AIProvider</code> interface isolating runtime models from ticket business logic. Integrates Google Gemini API (<code>gemini-1.5-flash</code>) with deterministic, rule-based offline demo fallback when uncredentialed.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  3. Defensive Prompt Engineering
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Strict data-vs-instruction partitioning: customer messages are sandboxed inside <code>&lt;customer_message&gt;</code> tags. System prompt explicitly instructs model to ignore prompt injection overrides and avoid hallucinating account facts.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  4. Persistence &amp; Hybrid Storage
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  PostgreSQL schema with Supabase migrations for production, coupled with a zero-dependency local relational persistence engine for seamless local evaluation and testing without external database dependencies.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "prompts" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Prompt Engineering Evolution &amp; Revisions
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              The AI triage prompt underwent multiple iterations to transition from free-form analysis to schema-constrained, injection-resilient copilot output.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Iteration 1: Baseline Analysis Prompt (v1.0.0)</span>
                  <span className="text-[10px] font-mono text-amber-600">Free-form Text</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                  <strong>Defect Observed:</strong> Raw text responses lacked consistent JSON formatting, occasionally output Markdown code fences, and hallucinated that customer refunds were already executed.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Iteration 2: Strict JSON Schema &amp; Anti-Hallucination (v1.1.0)</span>
                  <span className="text-[10px] font-mono text-blue-600">Zod Validated</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                  <strong>Improvement:</strong> Added strict Zod schema validation and explicit anti-hallucination rule (&quot;Never claim actions have already been executed unless verified&quot;).
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-300">
                  <span>Iteration 3: Defensive Prompt Sandboxing &amp; Injection Defense (v1.2.0 - Current)</span>
                  <span className="text-[10px] font-mono text-emerald-600">Production Ready</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-1">
                  <strong>Enhancement:</strong> Sandboxed customer messages in XML tags, added explicit heuristic prompt-injection override detection, uncertainty threshold flagging, and missing information extraction.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "testing" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Automated Verification &amp; Testing
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              The project includes unit tests, integration tests, and Playwright end-to-end browser tests verifying ticket creation, AI output schema parsing, prompt-injection defense, review state transitions, and metric calculations.
            </p>
            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
              <p># Run automated unit &amp; integration tests</p>
              <p className="text-emerald-400">npm test</p>
              <p className="pt-2"># Run TypeScript strict type verification</p>
              <p className="text-emerald-400">npm run typecheck</p>
              <p className="pt-2"># Run production compilation build</p>
              <p className="text-emerald-400">npm run build</p>
            </div>
          </div>
        )}

        {activeTab === "script" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Video Presentation Script (2-3 Minutes Walkthrough)
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Structured walkthrough for the Gokul Infocare assessment presentation:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 text-[11px]">
              <li><strong>0:00 - 0:30 (Problem &amp; AI Tools):</strong> Introduction to customer support triage latency and inconsistent classification. Introduction of FlowPilot AI built with Claude Code, Next.js, and Google Gemini API.</li>
              <li><strong>0:30 - 1:00 (Prompt Engineering Evolution):</strong> Walk through Prompt Log v1.0 to v1.2, highlighting data sandboxing and prompt-injection defense.</li>
              <li><strong>1:00 - 1:45 (Live Demo):</strong> Ingest a high-urgency outage ticket, inspect AI classification, confidence score, and suggested response. Demonstrate human-in-the-loop approval.</li>
              <li><strong>1:45 - 2:15 (Prompt Injection Defense):</strong> Show ticket #6 where an adversary attempts system override; show model tagging security incident and blocking action.</li>
              <li><strong>2:15 - 2:45 (Technical Decisions &amp; Conclusion):</strong> Explain repository pattern, hybrid Supabase/local persistence, test suite, and ethical AI design.</li>
            </ol>
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Assessment Submission Deliverables Checklist
            </h2>
            <div className="space-y-2">
              {[
                { title: "One Project in Technology / Automation", status: "Completed (FlowPilot AI)" },
                { title: "Meaningful Use of AI in Development", status: "Completed (Gemini API & Claude Code)" },
                { title: "Working Full-Stack Application", status: "Completed (Next.js 15, React 19, Tailwind)" },
                { title: "Deterministic Demo Mode (Offline)", status: "Completed (Zero-key runnable)" },
                { title: "Prompt Engineering Log Documented", status: "Completed (docs/prompt-engineering-log.md)" },
                { title: "Video Presentation Script Prepared", status: "Completed (docs/demo-script.md)" },
                { title: "Testing Report with Real Execution", status: "Completed (docs/testing-report.md)" },
                { title: "Architecture & Schema Documentation", status: "Completed (docs/architecture.md)" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    ✓ {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
