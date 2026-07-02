// // src/features/reports/pages/ReportsPage.tsx
// //
// // Reports page (Image 1 / Image 4 in your screenshots).
// // Shows: Report Configuration checklist, Preview panel with health score,
// //        issues summary, top recommendations, and Download PDF button.
// // Connects to: GET /analytics, GET /scans, GET /scans/:id/report (PDF blob)

// import React, { useState } from "react";
// import { useProject } from "../../projects/context/ProjectContext";
// import { useReportSummary } from "../../analytics/hooks/useAnalyticsData";
// import { getScanReport } from "../../analytics/api/analytics.service";

// // ── Report config options (all checked by default) ──────────────────────────

// const CONFIG_ITEMS = [
//   { id: "executive",    label: "Executive Summary",   desc: "High-level overview of code health" },
//   { id: "issues",       label: "Issues Breakdown",    desc: "Detailed list of all detected issues" },
//   { id: "complexity",   label: "Complexity Analysis", desc: "Cognitive complexity metrics" },
//   { id: "trends",       label: "Historical Trends",   desc: "Code health over time" },
//   { id: "ai",          label: "AI Recommendations",   desc: "Suggested improvements" },
// ] as const;

// // ── Sub-components ─────────────────────────────────────────────────────────

// const CheckIcon: React.FC = () => (
//   <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
//     <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
//       <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   </div>
// );

// const InnerCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
//   children,
//   className = "",
// }) => (
//   <div className={`rounded-xl border border-slate-700 bg-slate-800/60 p-4 ${className}`}>
//     {children}
//   </div>
// );

// // ── Main Page ──────────────────────────────────────────────────────────────

// const ReportsPage: React.FC = () => {
//   const { activeProject } = useProject();
//   const projectId = activeProject ? Number(activeProject.id) : null;

//   const { data: report, isLoading, error } = useReportSummary(projectId);

//   const [checkedItems, setCheckedItems] = useState<Set<string>>(
//     new Set(CONFIG_ITEMS.map((i) => i.id)),
//   );
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [downloadError, setDownloadError] = useState<string | null>(null);

//   const toggleItem = (id: string) => {
//     setCheckedItems((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   const handleDownloadPDF = async () => {
//     if (!report?.latestScanId) {
//       setDownloadError("No completed scan found. Run a scan first.");
//       return;
//     }
//     setIsDownloading(true);
//     setDownloadError(null);
//     try {
//       const blob = await getScanReport(report.latestScanId);
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `codepilot-report-${activeProject?.repoName ?? "project"}.pdf`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       setDownloadError("Failed to download report. Please try again.");
//       console.error("Report download error:", err);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   if (!activeProject) {
//     return (
//       <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
//         <p className="text-slate-400 text-sm">
//           Select a project to generate and export reports.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* ── Header ── */}
//       <div>
//         <h1 className="text-2xl font-black text-slate-100">Reports</h1>
//         <p className="text-xs text-slate-500 mt-1">
//           Generate and export comprehensive analysis reports
//         </p>
//       </div>

//       {/* ── Two-column layout ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left: Configuration */}
//         <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col">
//           <div className="flex items-center gap-2 mb-6">
//             <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
//               <rect x="1.5" y="1.5" width="15" height="15" rx="2.5" />
//               <line x1="5" y1="6" x2="13" y2="6" />
//               <line x1="5" y1="9" x2="13" y2="9" />
//               <line x1="5" y1="12" x2="10" y2="12" />
//             </svg>
//             <h2 className="text-base font-bold text-slate-100">Report Configuration</h2>
//           </div>

//           <div className="space-y-5 flex-1">
//             {CONFIG_ITEMS.map((item) => (
//               <div
//                 key={item.id}
//                 className="flex items-start gap-3 cursor-pointer group"
//                 onClick={() => toggleItem(item.id)}
//               >
//                 {checkedItems.has(item.id) ? (
//                   <CheckIcon />
//                 ) : (
//                   <div className="w-5 h-5 rounded-full border border-slate-600 flex-shrink-0 mt-0.5 group-hover:border-violet-500 transition-colors" />
//                 )}
//                 <div>
//                   <p className="text-sm font-semibold text-slate-200">{item.label}</p>
//                   <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={handleDownloadPDF}
//             disabled={isDownloading || isLoading || !report?.latestScanId}
//             className="mt-8 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold text-white"
//           >
//             {isDownloading
//               ? "Compiling PDF…"
//               : isLoading
//               ? "Loading…"
//               : !report?.latestScanId
//               ? "No Scan Available"
//               : "Download PDF Report"}
//           </button>

//           {downloadError && (
//             <p className="mt-2 text-xs text-rose-400 text-center">{downloadError}</p>
//           )}
//         </div>

//         {/* Right: Preview */}
//         <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col gap-4">
//           {/* Preview header */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
//                 <rect x="1" y="3" width="15" height="12" rx="2" />
//                 <line x1="5" y1="1" x2="5" y2="5" />
//                 <line x1="12" y1="1" x2="12" y2="5" />
//               </svg>
//               <h2 className="text-base font-bold text-slate-100">Preview</h2>
//             </div>
//             <button
//               onClick={handleDownloadPDF}
//               disabled={isDownloading || isLoading || !report?.latestScanId}
//               className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl px-3 py-1.5 text-xs font-bold text-white"
//             >
//               ⬇ Download PDF
//             </button>
//           </div>

//           {isLoading ? (
//             <div className="space-y-3 animate-pulse">
//               <div className="h-20 bg-slate-800 rounded-xl" />
//               <div className="h-32 bg-slate-800 rounded-xl" />
//               <div className="h-28 bg-slate-800 rounded-xl" />
//             </div>
//           ) : error || !report ? (
//             <div className="flex-1 flex items-center justify-center">
//               <p className="text-slate-500 text-sm text-center">
//                 Run a scan to generate report preview data.
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Health Score */}
//               <InnerCard>
//                 <div className="flex items-center gap-2">
//                   <span className="text-emerald-400 text-base">↗</span>
//                   <span className="text-base font-black text-slate-100">
//                     Health Score: {report.healthScore}/100
//                   </span>
//                 </div>
//                 <p className="text-xs text-slate-400 mt-2">
//                   {report.healthScore >= 70
//                     ? "Your codebase is in good health."
//                     : report.healthScore >= 40
//                     ? "Your codebase has some technical debt to address."
//                     : "Your codebase needs significant refactoring attention."}
//                   {report.latestScanDate && (
//                     <span className="ml-1 text-slate-500">
//                       Last scan: {new Date(report.latestScanDate).toLocaleDateString()}
//                     </span>
//                   )}
//                 </p>
//               </InnerCard>

//               {/* Issues Summary */}
//               <InnerCard>
//                 <div className="flex items-center gap-2 mb-3">
//                   <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#f97316" strokeWidth="1.8">
//                     <path d="M6.5 1L1 12h11L6.5 1z" />
//                     <line x1="6.5" y1="5" x2="6.5" y2="8" />
//                     <circle cx="6.5" cy="10" r=".5" fill="#f97316" />
//                   </svg>
//                   <span className="text-xs font-semibold text-amber-400">Issues Summary</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-x-6 gap-y-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-slate-400">Critical</span>
//                     <span className="text-sm font-black text-rose-400">
//                       {report.issuesByStatus.critical}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-slate-400">High</span>
//                     <span className="text-sm font-black text-orange-400">
//                       {report.issuesByStatus.high}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-slate-400">Medium</span>
//                     <span className="text-sm font-black text-yellow-400">
//                       {report.issuesByStatus.medium}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-slate-400">Low</span>
//                     <span className="text-sm font-black text-emerald-400">
//                       {report.issuesByStatus.low}
//                     </span>
//                   </div>
//                 </div>
//               </InnerCard>

//               {/* Technical Metrics */}
//               <InnerCard>
//                 <div className="flex items-center gap-2 mb-3">
//                   <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
//                     <rect x="1" y="1" width="11" height="11" rx="1.5" />
//                     <line x1="3" y1="4" x2="10" y2="4" />
//                     <line x1="3" y1="6.5" x2="10" y2="6.5" />
//                     <line x1="3" y1="9" x2="7" y2="9" />
//                   </svg>
//                   <span className="text-xs font-semibold text-violet-400">Technical Metrics</span>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-xs text-slate-400">Avg. Complexity</span>
//                     <span className="text-xs font-bold text-slate-200">
//                       {report.avgComplexity.toFixed(1)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-xs text-slate-400">Debt Score</span>
//                     <span className="text-xs font-bold text-slate-200">{report.debtScore}</span>
//                   </div>
//                 </div>
//               </InnerCard>

//               {/* Top Recommendations */}
//               <InnerCard>
//                 <div className="flex items-center gap-2 mb-3">
//                   <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
//                     <rect x="1" y="1" width="11" height="11" rx="1.5" />
//                     <line x1="3" y1="4" x2="10" y2="4" />
//                     <line x1="3" y1="6.5" x2="10" y2="6.5" />
//                     <line x1="3" y1="9" x2="7" y2="9" />
//                   </svg>
//                   <span className="text-xs font-semibold text-violet-400">Top Recommendations</span>
//                 </div>
//                 <div className="space-y-2">
//                   {report.topRecommendations.map((rec, i) => (
//                     <div key={i} className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
//                       <p className="text-xs text-slate-400 leading-relaxed">{rec}</p>
//                     </div>
//                   ))}
//                 </div>
//               </InnerCard>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportsPage;


// src/features/reports/pages/ReportsPage.tsx
//
// FIX: The backend GET /scans/:id/report returns 501 Not Implemented.
// The PDF generation feature is NOT built on the backend (the service
// literally throws: throw new ApiError('Report generation not yet implemented', 501)).
//
// Solution: Generate the PDF entirely on the frontend using the analytics
// data we already have in memory. Uses the browser's built-in print API
// (window.print) with a print-only stylesheet — no extra libraries needed.
// Works offline, instant, and produces a clean PDF that matches the preview.

import React, { useState } from 'react'
import { useProject } from '../../projects/context/ProjectContext'
import { useReportSummary } from '../../analytics/hooks/useAnalyticsData'

// ── Helpers ────────────────────────────────────────────────────────────────

const CheckIcon: React.FC = () => (
  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
)

const InnerCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 ${className}`}>
    {children}
  </div>
)

const CONFIG_ITEMS = [
  { id: 'executive',  label: 'Executive Summary',   desc: 'High-level overview of code health' },
  { id: 'issues',     label: 'Issues Breakdown',    desc: 'Detailed list of all detected issues' },
  { id: 'complexity', label: 'Complexity Analysis', desc: 'Cognitive complexity metrics' },
  { id: 'trends',     label: 'Historical Trends',   desc: 'Code health over time' },
  { id: 'ai',         label: 'AI Recommendations',  desc: 'Suggested improvements' },
] as const

// ── Frontend PDF generator ─────────────────────────────────────────────────
// Opens a new window with a print-ready HTML page and triggers window.print().
// The user saves it as PDF from the browser print dialog.

function generateAndPrintReport(params: {
  projectName: string
  scanDate: string | null
  healthScore: number
  avgComplexity: number
  debtScore: number
  issuesByStatus: { critical: number; high: number; medium: number; low: number }
  topRecommendations: string[]
  sections: string[]
}) {
  const {
    projectName,
    scanDate,
    healthScore,
    avgComplexity,
    debtScore,
    issuesByStatus,
    topRecommendations,
    sections,
  } = params

  const formattedDate = scanDate
    ? new Date(scanDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const totalIssues =
    issuesByStatus.critical + issuesByStatus.high + issuesByStatus.medium + issuesByStatus.low

  const healthColor =
    healthScore >= 70 ? '#16a34a' : healthScore >= 40 ? '#d97706' : '#dc2626'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CodePilot Report — ${projectName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      color: #111827;
      background: #fff;
      padding: 40px 48px;
      font-size: 13px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #7c3aed;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .logo { font-size: 20px; font-weight: 900; color: #7c3aed; }
    .meta { text-align: right; font-size: 11px; color: #6b7280; }
    .meta strong { color: #374151; font-size: 13px; }
    h1 { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
    h2 {
      font-size: 14px; font-weight: 700; color: #374151;
      border-left: 3px solid #7c3aed; padding-left: 10px;
      margin: 24px 0 12px;
    }
    .grid-4 {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      margin-bottom: 24px;
    }
    .stat-box {
      border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 14px 16px; background: #f9fafb;
    }
    .stat-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; }
    .stat-value { font-size: 26px; font-weight: 900; margin-top: 4px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; background: #f9fafb; }
    .issue-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
    .issue-row:last-child { border-bottom: none; }
    .badge {
      display: inline-block; border-radius: 4px;
      padding: 2px 8px; font-size: 11px; font-weight: 700;
    }
    .rec-item { display: flex; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #374151; }
    .rec-dot { width: 6px; height: 6px; border-radius: 50%; background: #7c3aed; flex-shrink: 0; margin-top: 5px; }
    .section-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .section-badge {
      border: 1px solid #ddd6fe; border-radius: 6px;
      padding: 4px 10px; font-size: 11px; color: #7c3aed; background: #ede9fe;
    }
    .footer {
      margin-top: 40px; padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px; color: #9ca3af; text-align: center;
    }
    @media print {
      body { padding: 20px 28px; }
      @page { margin: 0.5in; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">⬡ CodePilot</div>
      <h1 style="margin-top:8px">${projectName}</h1>
      <p style="color:#6b7280;font-size:12px">Code Analysis Report</p>
    </div>
    <div class="meta">
      <strong>Generated on</strong><br/>
      ${formattedDate}
      ${scanDate ? `<br/><span style="color:#9ca3af">Scan date: ${formattedDate}</span>` : ''}
    </div>
  </div>

  <!-- Health Score -->
  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:20px;margin-bottom:24px;display:flex;align-items:center;gap:24px;">
    <div style="text-align:center;">
      <div style="font-size:48px;font-weight:900;color:${healthColor};line-height:1">${healthScore}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px">Health Score / 100</div>
    </div>
    <div>
      <p style="font-size:14px;font-weight:700;color:#111827">
        ${healthScore >= 70 ? '✓ Codebase is in good health' : healthScore >= 40 ? '⚠ Some technical debt to address' : '✗ Significant refactoring needed'}
      </p>
      <p style="font-size:12px;color:#6b7280;margin-top:4px">
        Average Complexity: <strong>${avgComplexity.toFixed(1)}</strong> &nbsp;|&nbsp;
        Technical Debt Score: <strong>${debtScore}</strong> &nbsp;|&nbsp;
        Total Issues: <strong>${totalIssues}</strong>
      </p>
    </div>
  </div>

  <!-- Stats -->
  ${sections.includes('executive') ? `
  <h2>Executive Summary</h2>
  <div class="grid-4">
    <div class="stat-box">
      <div class="stat-label">Critical</div>
      <div class="stat-value" style="color:#dc2626">${issuesByStatus.critical}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">High</div>
      <div class="stat-value" style="color:#ea580c">${issuesByStatus.high}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Medium</div>
      <div class="stat-value" style="color:#ca8a04">${issuesByStatus.medium}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Low</div>
      <div class="stat-value" style="color:#16a34a">${issuesByStatus.low}</div>
    </div>
  </div>
  ` : ''}

  <!-- Issues Breakdown -->
  ${sections.includes('issues') ? `
  <h2>Issues Breakdown</h2>
  <div class="card" style="margin-bottom:24px">
    <div class="issue-row">
      <span style="color:#6b7280">Severity</span>
      <span style="color:#6b7280">Count</span>
    </div>
    <div class="issue-row">
      <span>Critical — Requires immediate attention</span>
      <span class="badge" style="background:#fee2e2;color:#dc2626">${issuesByStatus.critical}</span>
    </div>
    <div class="issue-row">
      <span>High — Should be addressed soon</span>
      <span class="badge" style="background:#ffedd5;color:#ea580c">${issuesByStatus.high}</span>
    </div>
    <div class="issue-row">
      <span>Medium — Plan to fix in next sprint</span>
      <span class="badge" style="background:#fefce8;color:#ca8a04">${issuesByStatus.medium}</span>
    </div>
    <div class="issue-row">
      <span>Low — Monitor over time</span>
      <span class="badge" style="background:#f0fdf4;color:#16a34a">${issuesByStatus.low}</span>
    </div>
  </div>
  ` : ''}

  <!-- Complexity -->
  ${sections.includes('complexity') ? `
  <h2>Complexity Analysis</h2>
  <div class="grid-2" style="margin-bottom:24px">
    <div class="card">
      <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Average Cyclomatic Complexity</div>
      <div style="font-size:32px;font-weight:900;margin-top:6px;color:${avgComplexity < 10 ? '#16a34a' : avgComplexity < 20 ? '#d97706' : '#dc2626'}">${avgComplexity.toFixed(2)}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:4px">${avgComplexity < 10 ? 'Low — good maintainability' : avgComplexity < 20 ? 'Moderate — review complex functions' : 'High — refactoring recommended'}</div>
    </div>
    <div class="card">
      <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Technical Debt Score</div>
      <div style="font-size:32px;font-weight:900;margin-top:6px;color:#7c3aed">${debtScore}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:4px">Weighted sum of issue severities</div>
    </div>
  </div>
  ` : ''}

  <!-- Recommendations -->
  ${sections.includes('ai') && topRecommendations.length > 0 ? `
  <h2>AI Recommendations</h2>
  <div class="card" style="margin-bottom:24px">
    ${topRecommendations.map(rec => `
      <div class="rec-item">
        <div class="rec-dot"></div>
        <span>${rec}</span>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Sections included -->
  <h2>Report Sections</h2>
  <div class="section-list" style="margin-bottom:32px">
    ${CONFIG_ITEMS.filter(i => sections.includes(i.id)).map(i => `
      <span class="section-badge">✓ ${i.label}</span>
    `).join('')}
  </div>

  <div class="footer">
    Generated by CodePilot · ${new Date().toISOString()} · This report reflects the latest completed scan.
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    alert('Allow pop-ups for this site to download the PDF report.')
    return
  }
  win.document.write(html)
  win.document.close()
}

// ── Main Page ──────────────────────────────────────────────────────────────

const ReportsPage: React.FC = () => {
  const { activeProject } = useProject()
  const projectId = activeProject ? Number(activeProject.id) : null

  const { data: report, isLoading, error } = useReportSummary(projectId)

  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(CONFIG_ITEMS.map((i) => i.id)),
  )

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDownloadPDF = () => {
    if (!report) return
    generateAndPrintReport({
      projectName: activeProject
        ? `${activeProject.owner}/${activeProject.repoName}`
        : 'Unknown Project',
      scanDate: report.latestScanDate,
      healthScore: report.healthScore,
      avgComplexity: report.avgComplexity,
      debtScore: report.debtScore,
      issuesByStatus: report.issuesByStatus,
      topRecommendations: report.topRecommendations,
      sections: Array.from(checkedItems),
    })
  }

  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Select a project to generate and export reports.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reports</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate and export comprehensive analysis reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#2563eb" strokeWidth="1.8">
              <rect x="1.5" y="1.5" width="15" height="15" rx="2.5" />
              <line x1="5" y1="6" x2="13" y2="6" />
              <line x1="5" y1="9" x2="13" y2="9" />
              <line x1="5" y1="12" x2="10" y2="12" />
            </svg>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Report Configuration</h2>
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
                  <div className="w-5 h-5 rounded-full border border-slate-400 dark:border-slate-600 flex-shrink-0 mt-0.5 group-hover:border-blue-500 transition-colors" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isLoading || !report || checkedItems.size === 0}
            className="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold text-white"
          >
            {isLoading ? 'Loading…' : !report ? 'Run a scan first' : '⬇ Download PDF Report'}
          </button>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
            Opens print dialog → Save as PDF
          </p>
        </div>

        {/* Right: Preview */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#2563eb" strokeWidth="1.8">
                <rect x="1" y="3" width="15" height="12" rx="2" />
                <line x1="5" y1="1" x2="5" y2="5" />
                <line x1="12" y1="1" x2="12" y2="5" />
              </svg>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Preview</h2>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading || !report}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl px-3 py-1.5 text-xs font-bold text-white"
            >
              ⬇ Download PDF
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ) : error || !report ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                Run a scan first to generate report preview data.
              </p>
            </div>
          ) : (
            <>
              <InnerCard>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 dark:text-emerald-400 text-base">↗</span>
                  <span className="text-base font-black text-blue-600 dark:text-white">
                    Health Score: {report.healthScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {report.healthScore >= 70
                    ? 'Your codebase is in good health.'
                    : report.healthScore >= 40
                    ? 'Your codebase has some technical debt to address.'
                    : 'Your codebase needs significant refactoring attention.'}
                  {report.latestScanDate && (
                    <span className="ml-1 text-slate-400 dark:text-slate-500">
                      Last scan: {new Date(report.latestScanDate).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </InnerCard>

              <InnerCard>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#f97316" strokeWidth="1.8">
                    <path d="M6.5 1L1 12h11L6.5 1z" />
                    <line x1="6.5" y1="5" x2="6.5" y2="8" />
                    <circle cx="6.5" cy="10" r=".5" fill="#f97316" />
                  </svg>
                  <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">Issues Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div className="flex justify-between"><span className="text-xs text-slate-500 dark:text-slate-400">Critical</span><span className="text-sm font-black text-rose-500 dark:text-rose-400">{report.issuesByStatus.critical}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500 dark:text-slate-400">High</span><span className="text-sm font-black text-orange-500 dark:text-orange-400">{report.issuesByStatus.high}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500 dark:text-slate-400">Medium</span><span className="text-sm font-black text-yellow-500 dark:text-yellow-400">{report.issuesByStatus.medium}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500 dark:text-slate-400">Low</span><span className="text-sm font-black text-emerald-500 dark:text-emerald-400">{report.issuesByStatus.low}</span></div>
                </div>
              </InnerCard>

              <InnerCard>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#2563eb" strokeWidth="1.8">
                    <rect x="1" y="1" width="11" height="11" rx="1.5" />
                    <line x1="3" y1="4" x2="10" y2="4" />
                    <line x1="3" y1="6.5" x2="10" y2="6.5" />
                    <line x1="3" y1="9" x2="7" y2="9" />
                  </svg>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Top Recommendations</span>
                </div>
                {report.topRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </InnerCard>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsPage