"use client";

import React, { useState } from "react";
import { AIAnalysis } from "@/lib/types";
import { PriorityBadge, TeamBadge } from "@/components/ui/Badge";
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  Edit3,
  Clock,
  Send,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAnalysisPanelProps {
  analysis: AIAnalysis | null;
  onApproveResponse: (response: string) => void;
  onRejectResponse: (reason: string) => void;
  isProcessing: boolean;
}

export function AIAnalysisPanel({
  analysis,
  onApproveResponse,
  onRejectResponse,
  isProcessing,
}: AIAnalysisPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(analysis?.suggested_response || "");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!analysis) {
    return (
      <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No AI Analysis Available
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Click &quot;Retry AI Analysis&quot; above to trigger model triage.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedText : analysis.suggested_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidencePct = Math.round(analysis.confidence_score * 100);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden space-y-4 p-5">
      {/* Top Header & Model Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Copilot Analysis</span>
              {analysis.status === "failed" && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                  Failed
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Provider: {analysis.provider} ({analysis.model}) • Prompt {analysis.prompt_version} {analysis.latency_ms ? `• ${analysis.latency_ms}ms` : ""}
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[11px] font-mono text-slate-400">Confidence</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {confidencePct}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
            {confidencePct}
          </div>
        </div>
      </div>

      {/* Security Incident / Prompt Injection Warning Banner */}
      {analysis.potential_security_risk && (
        <div className="p-3.5 rounded-lg border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/50 text-red-800 dark:text-red-200 text-xs space-y-1.5 animate-pulse">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>SECURITY ADVISORY: Potential Prompt Injection / Override Attempt</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {analysis.security_notes ||
              "The customer message contains patterns attempting to override system instructions or command unauthorized actions."}
          </p>
        </div>
      )}

      {/* Uncertainty Warning Banner */}
      {analysis.is_uncertain && !analysis.potential_security_risk && (
        <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Low Confidence Classification ({confidencePct}%)</span>
          </div>
          <p className="text-[11px]">
            The customer request lacks sufficient technical or account context. Human review and clarification are strongly recommended.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
        <span className="font-semibold text-slate-900 dark:text-white block mb-1">
          Executive Summary
        </span>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Category
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {analysis.category.replace(/_/g, " ")}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Priority
          </span>
          <PriorityBadge priority={analysis.priority} />
        </div>

        <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Sentiment
          </span>
          <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
            {analysis.sentiment}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Recommended Team
          </span>
          <TeamBadge team={analysis.recommended_team} />
        </div>
      </div>

      {/* Priority Rationale & Recommended Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
          <span className="font-semibold text-slate-900 dark:text-white block mb-1">
            Priority Evidence &amp; Rationale
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            {analysis.priority_reasoning}
          </p>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
          <span className="font-semibold text-slate-900 dark:text-white block mb-1">
            Recommended Agent Action
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            {analysis.recommended_action}
          </p>
        </div>
      </div>

      {/* Missing Information Checklist */}
      {analysis.missing_information && analysis.missing_information.length > 0 && (
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs">
          <span className="font-semibold text-amber-900 dark:text-amber-300 block mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Missing Information To Clarify</span>
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
            {analysis.missing_information.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Customer Response Box */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <FileCheck2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Suggested Customer Response (Human Review Required)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 transition"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 transition"
              title="Edit response text"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 text-xs">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                rows={6}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditedText(analysis.suggested_response);
                    setIsEditing(false);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-[11px] rounded bg-brand-600 text-white font-medium hover:bg-brand-700"
                >
                  Save Edits
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {editedText || analysis.suggested_response}
            </p>
          )}
        </div>

        {/* Action Buttons: Approve Draft vs Reject */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            * Human approval records review decision into audit ledger.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 disabled:opacity-50 transition"
            >
              Reject Draft
            </button>
            <button
              onClick={() => onApproveResponse(editedText || analysis.suggested_response)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Suggested Reply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 max-w-md w-full space-y-3 shadow-xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Reject Suggested Response
            </h4>
            <p className="text-xs text-slate-500">
              Please document why the model suggestion is being rejected (recorded into audit timeline):
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Inaccurate billing policy assumption, tone too formal, requires phone escalation..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRejectResponse(rejectReason);
                  setShowRejectModal(false);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
