// src/features/reports/pages/ReportsPage.tsx
//
// Reports page (Image 1 / Image 4 in your screenshots).
// Shows: Report Configuration checklist, Preview panel with health score,
//        issues summary, top recommendations, and Download PDF button.
// Connects to: GET /analytics, GET /scans, GET /scans/:id/report (PDF blob)

import React, { useState } from "react";
import { useProject } from "../../projects/context/ProjectContext";
import { useReportSummary } from "../../analytics/hooks/useAnalyticsData";
import { getScanReport } from "../../analytics/api/analytics.service";

// ── Report config options (all checked by default) ──────────────────────────

const CONFIG_ITEMS = [
  { id: "executive",    label: "Executive Summary",   desc: "High-level overview of code health" },
  { id: "issues",       label: "Issues Breakdown",    desc: "Detailed list of all detected issues" },
  { id: "complexity",   label: "Complexity Analysis", desc: "Cognitive complexity metrics" },
  { id: "trends",       label: "Historical Trends",   desc: "Code health over time" },
  { id: "ai",          label: "AI Recommendations",   desc: "Suggested improvements" },
] as const;

// ── Sub-components ─────────────────────────────────────────────────────────

const CheckIcon: React.FC = () => (
  <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const InnerCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`rounded-xl border border-slate-700 bg-slate-800/60 p-4 ${className}`}>
    {children}
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────

const ReportsPage: React.FC = () => {
  const { activeProject } = useProject();
  const projectId = activeProject ? Number(activeProject.id) : null;

  const { data: report, isLoading, error } = useReportSummary(projectId);

  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(CONFIG_ITEMS.map((i) => i.id)),
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadPDF = async () => {
    if (!report?.latestScanId) {
      setDownloadError("No completed scan found. Run a scan first.");
      return;
    }
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const blob = await getScanReport(report.latestScanId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codepilot-report-${activeProject?.repoName ?? "project"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError("Failed to download report. Please try again.");
      console.error("Report download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <p className="text-slate-400 text-sm">
          Select a project to generate and export reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black text-slate-100">Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate and export comprehensive analysis reports
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
              <rect x="1.5" y="1.5" width="15" height="15" rx="2.5" />
              <line x1="5" y1="6" x2="13" y2="6" />
              <line x1="5" y1="9" x2="13" y2="9" />
              <line x1="5" y1="12" x2="10" y2="12" />
            </svg>
            <h2 className="text-base font-bold text-slate-100">Report Configuration</h2>
          </div>

          <div className="space-y-5 flex-1">
            {CONFIG_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => toggleItem(item.id)}
              >
                {checkedItems.has(item.id) ? (
                  <CheckIcon />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-600 flex-shrink-0 mt-0.5 group-hover:border-violet-500 transition-colors" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || isLoading || !report?.latestScanId}
            className="mt-8 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold text-white"
          >
            {isDownloading
              ? "Compiling PDF…"
              : isLoading
              ? "Loading…"
              : !report?.latestScanId
              ? "No Scan Available"
              : "Download PDF Report"}
          </button>

          {downloadError && (
            <p className="mt-2 text-xs text-rose-400 text-center">{downloadError}</p>
          )}
        </div>

        {/* Right: Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col gap-4">
          {/* Preview header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
                <rect x="1" y="3" width="15" height="12" rx="2" />
                <line x1="5" y1="1" x2="5" y2="5" />
                <line x1="12" y1="1" x2="12" y2="5" />
              </svg>
              <h2 className="text-base font-bold text-slate-100">Preview</h2>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading || isLoading || !report?.latestScanId}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl px-3 py-1.5 text-xs font-bold text-white"
            >
              ⬇ Download PDF
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 bg-slate-800 rounded-xl" />
              <div className="h-32 bg-slate-800 rounded-xl" />
              <div className="h-28 bg-slate-800 rounded-xl" />
            </div>
          ) : error || !report ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500 text-sm text-center">
                Run a scan to generate report preview data.
              </p>
            </div>
          ) : (
            <>
              {/* Health Score */}
              <InnerCard>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-base">↗</span>
                  <span className="text-base font-black text-slate-100">
                    Health Score: {report.healthScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {report.healthScore >= 70
                    ? "Your codebase is in good health."
                    : report.healthScore >= 40
                    ? "Your codebase has some technical debt to address."
                    : "Your codebase needs significant refactoring attention."}
                  {report.latestScanDate && (
                    <span className="ml-1 text-slate-500">
                      Last scan: {new Date(report.latestScanDate).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </InnerCard>

              {/* Issues Summary */}
              <InnerCard>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#f97316" strokeWidth="1.8">
                    <path d="M6.5 1L1 12h11L6.5 1z" />
                    <line x1="6.5" y1="5" x2="6.5" y2="8" />
                    <circle cx="6.5" cy="10" r=".5" fill="#f97316" />
                  </svg>
                  <span className="text-xs font-semibold text-amber-400">Issues Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Critical</span>
                    <span className="text-sm font-black text-rose-400">
                      {report.issuesByStatus.critical}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">High</span>
                    <span className="text-sm font-black text-orange-400">
                      {report.issuesByStatus.high}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Medium</span>
                    <span className="text-sm font-black text-yellow-400">
                      {report.issuesByStatus.medium}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Low</span>
                    <span className="text-sm font-black text-emerald-400">
                      {report.issuesByStatus.low}
                    </span>
                  </div>
                </div>
              </InnerCard>

              {/* Technical Metrics */}
              <InnerCard>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
                    <rect x="1" y="1" width="11" height="11" rx="1.5" />
                    <line x1="3" y1="4" x2="10" y2="4" />
                    <line x1="3" y1="6.5" x2="10" y2="6.5" />
                    <line x1="3" y1="9" x2="7" y2="9" />
                  </svg>
                  <span className="text-xs font-semibold text-violet-400">Technical Metrics</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Avg. Complexity</span>
                    <span className="text-xs font-bold text-slate-200">
                      {report.avgComplexity.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Debt Score</span>
                    <span className="text-xs font-bold text-slate-200">{report.debtScore}</span>
                  </div>
                </div>
              </InnerCard>

              {/* Top Recommendations */}
              <InnerCard>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
                    <rect x="1" y="1" width="11" height="11" rx="1.5" />
                    <line x1="3" y1="4" x2="10" y2="4" />
                    <line x1="3" y1="6.5" x2="10" y2="6.5" />
                    <line x1="3" y1="9" x2="7" y2="9" />
                  </svg>
                  <span className="text-xs font-semibold text-violet-400">Top Recommendations</span>
                </div>
                <div className="space-y-2">
                  {report.topRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                      <p className="text-xs text-slate-400 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </InnerCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;