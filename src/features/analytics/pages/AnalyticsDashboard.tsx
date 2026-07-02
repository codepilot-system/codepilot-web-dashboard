// // import React, { useRef, useState } from "react";
// // import { useProject } from "../../projects/context/ProjectContext";
// // import { useRepoOverview } from "../hooks/useRepoOverview";
// // import { useDebtTrends } from "../hooks/useDebtTrends";
// // import { useLanguageBreakdown } from "../hooks/useLanguageBreakdown";
// // import { OverviewScorecards } from "../components/OverviewScorecards";
// // import { DebtTrendsChart } from "../components/DebtTrendsChart";
// // import { LanguageBreakdownChart } from "../components/LanguageBreakdownChart";
// // import { SeverityDistributionChart } from "../components/SeverityDistributionChart";
// // import { LanguageBreakdownTable } from "../components/LanguageBreakdownTable";
// // import { RangeSelector } from "../components/RangeSelector";
// // import { ExportReportButton } from "../components/ExportReportButton";
// // import { AnalyticsRange } from "../../../shared/types/analytics.types";

// // const Panel: React.FC<{
// //   title: string;
// //   subtitle?: string;
// //   right?: React.ReactNode;
// //   children: React.ReactNode;
// // }> = ({ title, subtitle, right, children }) => (
// //   <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
// //     <header className="mb-4 flex items-start justify-between gap-4">
// //       <div>
// //         <h2 className="text-base font-bold text-slate-100">{title}</h2>
// //         {subtitle && (
// //           <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
// //         )}
// //       </div>
// //       {right}
// //     </header>
// //     {children}
// //   </section>
// // );

// // const InlineStatus: React.FC<{
// //   loading: boolean;
// //   error: unknown;
// //   empty?: boolean;
// //   emptyMessage?: string;
// //   children: React.ReactNode;
// // }> = ({ loading, error, empty, emptyMessage, children }) => {
// //   if (loading) {
// //     return (
// //       <div className="flex h-48 items-center justify-center text-sm text-slate-500">
// //         Loading…
// //       </div>
// //     );
// //   }
// //   if (error) {
// //     return (
// //       <div className="flex h-48 items-center justify-center text-sm text-rose-400">
// //         Failed to load. Retry shortly.
// //       </div>
// //     );
// //   }
// //   if (empty) {
// //     return (
// //       <div className="flex h-48 items-center justify-center text-sm text-slate-500">
// //         {emptyMessage ?? "No data."}
// //       </div>
// //     );
// //   }
// //   return <>{children}</>;
// // };

// // export const AnalyticsDashboard: React.FC = () => {
// //   const { activeProject } = useProject();
// //   const [range, setRange] = useState<AnalyticsRange>("30d");
// //   const chartsRef = useRef<HTMLDivElement | null>(null);

// //   const repoId = activeProject?.id;

// //   const overviewQuery = useRepoOverview(repoId);
// //   const trendsQuery = useDebtTrends(repoId, range);
// //   const languageQuery = useLanguageBreakdown(repoId);

// //   if (!activeProject) {
// //     return (
// //       <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
// //         Pick a project from the top-right dropdown to load its analytics
// //         workspace.
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <header className="flex flex-wrap items-end justify-between gap-4">
// //         <div>
// //           <p className="text-xs uppercase tracking-wider text-slate-500">
// //             Analytics Overview
// //           </p>
// //           <h1 className="mt-1 text-2xl font-black text-slate-100">
// //             {activeProject.name}
// //           </h1>
// //           <p className="mt-1 text-xs text-slate-500">
// //             {activeProject.owner}/{activeProject.repoName}
// //           </p>
// //         </div>
// //         <div className="flex items-center gap-3">
// //           <RangeSelector value={range} onChange={setRange} />
// //           <ExportReportButton
// //             overview={overviewQuery.data}
// //             trends={trendsQuery.data}
// //             languages={languageQuery.data}
// //             chartsRef={chartsRef}
// //           />
// //         </div>
// //       </header>

// //       <InlineStatus
// //         loading={overviewQuery.isLoading}
// //         error={overviewQuery.error}
// //       >
// //         {overviewQuery.data && (
// //           <OverviewScorecards metrics={overviewQuery.data.scorecards} />
// //         )}
// //       </InlineStatus>

// //       <div ref={chartsRef} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
// //         <div className="lg:col-span-2">
// //           <Panel
// //             title="Technical Debt Trend"
// //             subtitle="Historical debt and quality score evolution"
// //           >
// //             <InlineStatus
// //               loading={trendsQuery.isLoading}
// //               error={trendsQuery.error}
// //               empty={(trendsQuery.data?.length ?? 0) === 0}
// //               emptyMessage="No trend data yet — trigger an initial scan."
// //             >
// //               {trendsQuery.data && <DebtTrendsChart data={trendsQuery.data} />}
// //             </InlineStatus>
// //           </Panel>
// //         </div>

// //         <Panel
// //           title="Severity Distribution"
// //           subtitle="Share of issues by severity"
// //         >
// //           <InlineStatus
// //             loading={overviewQuery.isLoading}
// //             error={overviewQuery.error}
// //           >
// //             {overviewQuery.data && (
// //               <SeverityDistributionChart
// //                 slices={overviewQuery.data.severityDistribution}
// //               />
// //             )}
// //           </InlineStatus>
// //         </Panel>

// //         <div className="lg:col-span-3">
// //           <Panel
// //             title="Language Breakdown"
// //             subtitle="Issue counts stacked by severity per language"
// //           >
// //             <InlineStatus
// //               loading={languageQuery.isLoading}
// //               error={languageQuery.error}
// //               empty={(languageQuery.data?.length ?? 0) === 0}
// //               emptyMessage="No language metrics available."
// //             >
// //               {languageQuery.data && (
// //                 <div className="space-y-6">
// //                   <LanguageBreakdownChart data={languageQuery.data} />
// //                   <LanguageBreakdownTable rows={languageQuery.data} />
// //                 </div>
// //               )}
// //             </InlineStatus>
// //           </Panel>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AnalyticsDashboard;
// import {useRepoOverview} from "../hooks/useRepoOverview";


// export default function AnalyticsDashboard(){

// const projectId=13; // later from ProjectContext


// const {
// data,
// isLoading
// }=useRepoOverview(projectId);



// if(isLoading)
// return <div>Loading...</div>;



// const analytics=data?.data?.[0];


// return (

// <div>


// <h1>
// Repository Analytics
// </h1>


// <h2>
// Technical Debt:
// {analytics?.technicalDebtScore}
// </h2>


// <h2>
// Average Complexity:
// {analytics?.avgComplexity}
// </h2>



// <pre>
// {
// JSON.stringify(
// analytics?.severityDistribution,
// null,
// 2
// )
// }
// </pre>


// </div>

// );

// }



// src/features/analytics/pages/AnalyticsDashboard.tsx
//
// Analytics page (Image 2 / Image 5 in your screenshots).
// Shows: 4 stat cards, Issues by Severity donut, Complexity Trend area chart,
//        Refactor Acceptance Rate progress bars, Top Improved Files list.
// Connects to: GET /analytics, GET /scans

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useProject } from "../../projects/context/ProjectContext";
import { useAnalyticsDashboard } from "../hooks/useAnalyticsData";

// ── Sub-components ─────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
  subHighlight?: string;
  icon: string;
  iconBg: string;
}> = ({ label, value, sub, subHighlight, icon, iconBg }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] p-5 flex items-start justify-between">
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
      {sub && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {subHighlight && (
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{subHighlight} </span>
          )}
          {sub}
        </p>
      )}
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconBg}`}>
      {icon}
    </div>
  </div>
);

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] p-5">
    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
    {children}
  </section>
);

// ── Main Page ──────────────────────────────────────────────────────────────

const AnalyticsDashboard: React.FC = () => {
  const { activeProject } = useProject();
  const projectId = activeProject ? Number(activeProject.id) : null;

  const { data: analytics, isLoading, error } = useAnalyticsDashboard(projectId);

  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Select a project from the dropdown to view analytics.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
        <p className="text-rose-400 text-sm font-medium">
          Failed to load analytics data. Run a scan first to generate analytics.
        </p>
      </div>
    );
  }

  // Build progress bar widths for acceptance rate
  const maxWeekTotal = Math.max(
    1,
    ...analytics.weeklyAcceptanceRate.map((w) => w.accepted + w.rejected),
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Analytics</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {activeProject.repoName}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Track your codebase health and refactoring progress
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Issues Found"
          value={analytics.totalIssuesFixed}
          subHighlight="↗"
          sub="across all scans"
          icon="✅"
          iconBg="bg-blue-500/20"
        />
        <StatCard
          label="Avg. Debt Score"
          value={analytics.avgDebtScore}
          sub="Across all scans"
          icon="📈"
          iconBg="bg-cyan-500/20"
        />
        <StatCard
          label="Avg. Complexity"
          value={analytics.latestAvgComplexity.toFixed(1)}
          sub="Latest scan"
          icon="📊"
          iconBg="bg-indigo-500/20"
        />
        <StatCard
          label="Scans Completed"
          value={analytics.weeklyAcceptanceRate.reduce((s, w) => s + w.accepted, 0)}
          sub="This project"
          icon="⚡"
          iconBg="bg-yellow-500/20"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Issues by Severity Donut */}
        <Panel title="Issues by Severity">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.severityDistribution}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="#0f172a"
                >
                  {analytics.severityDistribution.map((slice) => (
                    <Cell key={slice.severity} fill={slice.color} />
                  ))}
                </Pie>
                {/* <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    color: "#e2e8f0",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} (${analytics.severityDistribution.find((s) => s.label === name)?.percent ?? 0}%)`,
                    name,
                  ]}
                /> */}
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        color: "#e2e8f0",
                    }}
                    formatter={(value, name) => {
                        const count = Number(value);

                        const percent =
                        analytics.severityDistribution.find(
                            (s) => s.label === String(name)
                        )?.percent ?? 0;

                        return [`${count} (${percent}%)`, String(name)];
                    }}
                    />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Complexity Trend Area Chart */}
        <Panel title="Complexity Trend">
          {analytics.complexityTrend.length === 0 ? (
            <div className="flex items-center justify-center h-72 text-sm text-slate-500">
              No historical data yet — run multiple scans to see trends.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.complexityTrend}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="complexityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: 8,
                      color: "#e2e8f0",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgComplexity"
                    name="Avg. Complexity"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    fill="url(#complexityGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#22d3ee" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scan Activity (acceptance rate approximation) */}
        <Panel title="Scan Activity">
          {analytics.weeklyAcceptanceRate.length === 0 ? (
            <p className="text-slate-500 text-sm py-6 text-center">
              No scan data available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {analytics.weeklyAcceptanceRate.map((week) => {
                const total = week.accepted + week.rejected;
                const pct = total === 0 ? 0 : (week.accepted / maxWeekTotal) * 100;
                return (
                  <div key={week.week} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-14 flex-shrink-0">{week.week}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right flex-shrink-0">
                      {week.accepted} completed
                      {week.rejected > 0 && (
                        <span className="text-rose-500 dark:text-rose-400 ml-1">/ {week.rejected} failed</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Severity Breakdown Table */}
        <Panel title="Severity Breakdown">
          <div className="space-y-3">
            {analytics.severityDistribution.map((slice) => (
              <div key={slice.severity} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: slice.color }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 w-16 flex-shrink-0">
                  {slice.label}
                </span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${slice.percent}%`,
                      background: slice.color,
                    }}
                  />
                </div>
                <span className="text-xs font-bold w-10 text-right flex-shrink-0" style={{ color: slice.color }}>
                  {slice.count}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 w-12 text-right flex-shrink-0">
                  {slice.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;