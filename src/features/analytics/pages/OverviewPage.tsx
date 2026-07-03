import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useProject } from "../../projects/context/ProjectContext";
import { useRepoOverview, useStartScan, useScans } from "../hooks/useAnalyticsData";
import { issuesService } from "../../issues/api/issues.service";
import { useQuery } from "@tanstack/react-query";

// ── Sub-components ─────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
  valueClass?: string;
  icon: string;
  iconBg: string;
}> = ({ label, value, sub, valueClass = "text-slate-100", icon, iconBg }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-start justify-between">
    <div>
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      <p className={`text-3xl font-black leading-none ${valueClass}`}>{value}</p>
      {sub && <p className="mt-2 text-xs text-slate-500">{sub}</p>}
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconBg}`}>
      {icon}
    </div>
  </div>
);

const Panel: React.FC<{
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, right, children }) => (
  <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-slate-100">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

const ScanStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    IN_PROGRESS: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    COMPLETED:   "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    FAILED:      "bg-rose-500/20 text-rose-300 border-rose-500/40",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[status] ?? styles.COMPLETED}`}>
      {status.replace("_", " ")}
    </span>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────

export const OverviewPage: React.FC = () => {
  const { activeProject } = useProject();
  const projectId = activeProject ? Number(activeProject.id) : null;

  const { data: overview, isLoading, error } = useRepoOverview(projectId);
  const { data: scansData } = useScans(projectId);
  const startScan = useStartScan();

  const [branch, setBranch] = useState("main");

  // Fetch top issues to show most complex files
  const { data: issuesData } = useQuery({
    queryKey: ["topIssues", projectId],
    queryFn: () =>
      issuesService.getAll({
        projectId: String(projectId),
        severity: "HIGH",
        limit: 3,
      }),
    enabled: projectId !== null,
  });

  const latestScan = scansData?.data?.[0];

  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <p className="text-slate-400 text-sm">
          Select a project from the dropdown to view its overview.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-80 bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
        <p className="text-rose-400 text-sm font-medium">
          Failed to load analytics. Make sure at least one scan has completed for this project.
        </p>
      </div>
    );
  }

  const handleRescan = () => {
    if (!projectId) return;
    startScan.mutate({ projectId, branchName: branch });
  };

  const complexityData = overview.complexityTrend.map((p) => ({
    date: p.date,
    complexity: p.avgComplexity,
  }));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-100">
              {activeProject.repoName}
            </h1>
            {latestScan && <ScanStatusBadge status={latestScan.status} />}
          </div>
          <p className="text-xs text-slate-500 font-mono">
            {activeProject.owner}/{activeProject.repoName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="main">main</option>
            <option value="develop">develop</option>
            <option value="master">master</option>
          </select>
          <button
            onClick={handleRescan}
            disabled={startScan.isPending || latestScan?.status === "IN_PROGRESS"}
            className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={startScan.isPending ? "animate-spin" : ""}>↺</span>
            {startScan.isPending ? "Scanning…" : "Rescan"}
          </button>
          <a
            href="/issues"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors rounded-xl px-4 py-2 text-sm font-semibold text-white"
          >
            View Issues ↗
          </a>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Issues"
          value={overview.totalIssues}
          sub="Refactoring candidates"
          icon="🐛"
          iconBg="bg-blue-500/20"
        />
        <StatCard
          label="Critical Issues"
          value={overview.criticalIssues}
          valueClass={overview.criticalIssues > 0 ? "text-rose-400" : "text-slate-100"}
          sub="Requires immediate attention"
          icon="⚠️"
          iconBg="bg-rose-500/20"
        />
        <StatCard
          label="Debt Score"
          value={overview.debtScore}
          valueClass="text-amber-400"
          sub="Code Health Index"
          icon="💳"
          iconBg="bg-amber-500/20"
        />
        <StatCard
          label="Avg. Complexity"
          value={overview.avgComplexity.toFixed(1)}
          sub="Cyclomatic average"
          icon="📊"
          iconBg="bg-indigo-500/20"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Issues by Severity — Donut */}
        <Panel title="Issues by Severity">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview.severityDistribution}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="#0f172a"
                >
                  {overview.severityDistribution.map((slice) => (
                    <Cell key={slice.severity} fill={slice.color} />
                  ))}
                </Pie>
                 <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: 8,
                      color: "#e2e8f0",
                    }}
                    formatter={(value, name) => [
                      `${Number(value)} issues`,
                      String(name),
                    ]}
                  />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Complexity Trend */}
        <Panel
          title="Complexity Trend"
          right={<span className="text-xs text-slate-500">Last {complexityData.length} scans</span>}
        >
          {complexityData.length === 0 ? (
            <div className="flex items-center justify-center h-72 text-sm text-slate-500">
              Run more scans to see the trend.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complexityData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
                  <Line
                    type="monotone"
                    dataKey="complexity"
                    name="Avg. Complexity"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#22d3ee" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Issues as Most Complex Files */}
        <Panel
          title="Top Issues"
          right={
            <a href="/issues" className="text-xs text-violet-400 hover:text-violet-300 font-medium">
              View All →
            </a>
          }
        >
          {!issuesData?.data?.length ? (
            <p className="text-slate-500 text-sm py-6 text-center">
              No issues found — great job! 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {issuesData.data.slice(0, 3).map((issue: any, i: number) => {
                const severityColor: Record<string, string> = {
                  CRITICAL: "#ef4444",
                  HIGH:     "#f97316",
                  MEDIUM:   "#eab308",
                  LOW:      "#22c55e",
                };
                const color = severityColor[issue.severity] ?? "#6b7280";
                return (
                  <div key={issue.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                    <span className="text-xs text-slate-500 w-5 font-bold">#{i + 1}</span>
                    <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-xs">
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-slate-200 truncate">{issue.filePath}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Line {issue.lineNumber} · {issue.category}</p>
                    </div>
                    <div className="flex-shrink-0 w-20">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ background: color, width: issue.severity === "CRITICAL" ? "100%" : issue.severity === "HIGH" ? "78%" : "55%" }}
                      />
                    </div>
                    <span className="text-xs font-bold w-16 text-right" style={{ color }}>
                      {issue.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* AI Refactoring Insight (latest scan info) */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-violet-400">✦</span>
            <span className="text-sm font-bold text-violet-300">AI Refactoring Insight</span>
          </div>
          {overview.avgComplexity > 0 ? (
            <>
              <p className="text-sm text-violet-200 italic leading-relaxed">
                "Your codebase shows an average cyclomatic complexity of{" "}
                <strong className="text-violet-100 not-italic">{overview.avgComplexity.toFixed(1)}</strong>.
                {overview.criticalIssues > 0
                  ? ` There are ${overview.criticalIssues} critical issues that need immediate attention — address those first to reduce overall risk.`
                  : " Consider splitting large functions and extracting reusable utilities to lower complexity further."}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Addressing high-complexity files can reduce cognitive load by up to{" "}
                <strong className="text-violet-300">40%</strong> and significantly improve testability.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Run a scan to get AI-powered refactoring insights for this project.
            </p>
          )}
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
              Dismiss
            </button>
            <a
              href="/issues"
              className="flex-2 flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-xs font-semibold text-white text-center"
            >
              View Issues
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;