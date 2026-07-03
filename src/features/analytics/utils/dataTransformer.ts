import type {
  AnalyticsRecord,
  ScanRecord,
  SeveritySlice,
  ScorecardMetric,
  ComplexityTrendPoint,
  RepoOverviewSummary,
  AnalyticsSummary,
  ReportSummary,
  Severity,
  WeeklyRate,
} from "../../../shared/types/analytics.types";

// ── Constants ──────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: "#ef4444",
  HIGH:     "#f97316",
  MEDIUM:   "#eab308",
  LOW:      "#22c55e",
};

const SEVERITY_LABELS: Record<Severity, string> = {
  CRITICAL: "Critical",
  HIGH:     "High",
  MEDIUM:   "Medium",
  LOW:      "Low",
};

const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

// ── Helpers ────────────────────────────────────────────────────────────────

const fmtDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

const buildSeveritySlices = (
  dist: Record<string, number>,
): SeveritySlice[] => {
  const total = SEVERITY_ORDER.reduce((s, k) => s + (dist[k] ?? 0), 0);
  return SEVERITY_ORDER.map((severity) => {
    const count = dist[severity] ?? 0;
    return {
      severity,
      label: SEVERITY_LABELS[severity],
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
      color: SEVERITY_COLORS[severity],
    };
  });
};

// Normalize 0-100 health score: debtScore is minutes, cap at ~480h (28800 min)
const debtToHealth = (debtScore: number): number =>
  Math.max(0, Math.round(100 - (debtScore / 28800) * 100));

// ── Transformers ───────────────────────────────────────────────────────────

/**
 * Builds the repo Overview page summary from the latest analytics record
 * combined with all scans for trend data.
 */
export const buildRepoOverviewSummary = (
  analytics: AnalyticsRecord[],
  scans: ScanRecord[],
): RepoOverviewSummary => {
  const latest = analytics[0] ?? null; // already ordered desc by backend

  const dist = (latest?.severityDistribution ?? {}) as Record<string, number>;
  const severityDistribution = buildSeveritySlices(dist);

  const totalIssues = SEVERITY_ORDER.reduce((s, k) => s + (dist[k] ?? 0), 0);
  const criticalIssues = dist["CRITICAL"] ?? 0;
  const debtScore = latest?.technicalDebtScore ?? 0;
  const avgComplexity = latest?.avgComplexity ?? 0;

  const healthScore = debtToHealth(debtScore);

  const scorecards: ScorecardMetric[] = [
    {
      id: "issues",
      label: "Total Issues",
      value: totalIssues.toString(),
      hint: `${criticalIssues} critical`,
      tone: totalIssues === 0 ? "positive" : criticalIssues > 0 ? "danger" : "warning",
    },
    {
      id: "critical",
      label: "Critical Issues",
      value: criticalIssues.toString(),
      hint: "Requires immediate attention",
      tone: criticalIssues > 0 ? "danger" : "positive",
    },
    {
      id: "debt",
      label: "Debt Score",
      value: debtScore.toString(),
      hint: "Code Health Index",
      tone: healthScore > 70 ? "positive" : healthScore > 40 ? "warning" : "danger",
    },
    {
      id: "complexity",
      label: "Avg. Complexity",
      value: avgComplexity.toFixed(1),
      hint: "Cyclomatic average",
      tone: avgComplexity < 10 ? "positive" : avgComplexity < 20 ? "warning" : "danger",
    },
  ];

  // Build complexity trend from all analytics records (already desc, reverse for chart)
  const scanMap = new Map(scans.map((s) => [s.id, s]));
  const trend: ComplexityTrendPoint[] = [...analytics]
    .reverse()
    .map((a) => {
      const scan = scanMap.get(a.scanId);
      return {
        date: fmtDate(scan?.scanDate ?? a.generatedAt),
        isoDate: scan?.scanDate ?? a.generatedAt,
        avgComplexity: Math.round(a.avgComplexity * 10) / 10,
        debtScore: a.technicalDebtScore,
        scanId: a.scanId,
      };
    });

  return {
    totalIssues,
    criticalIssues,
    debtScore,
    avgComplexity,
    severityDistribution,
    scorecards,
    latestScanId: latest?.scanId ?? null,
    latestScanDate: scans[0]?.scanDate ?? null,
    complexityTrend: trend,
  };
};

/**
 * Builds the Analytics dashboard summary from all analytics records.
 */
export const buildAnalyticsSummary = (
  analytics: AnalyticsRecord[],
  scans: ScanRecord[],
): AnalyticsSummary => {
  const latest = analytics[0] ?? null;

  const dist = (latest?.severityDistribution ?? {}) as Record<string, number>;
  const severityDistribution = buildSeveritySlices(dist);

  const avgDebtScore = analytics.length
    ? Math.round(analytics.reduce((s, a) => s + a.technicalDebtScore, 0) / analytics.length)
    : 0;

  const totalIssuesFixed = SEVERITY_ORDER.reduce(
    (s, k) => s + (dist[k] ?? 0),
    0,
  );

  const scanMap = new Map(scans.map((s) => [s.id, s]));
  const complexityTrend: ComplexityTrendPoint[] = [...analytics]
    .reverse()
    .map((a) => {
      const scan = scanMap.get(a.scanId);
      return {
        date: fmtDate(scan?.scanDate ?? a.generatedAt),
        isoDate: scan?.scanDate ?? a.generatedAt,
        avgComplexity: Math.round(a.avgComplexity * 10) / 10,
        debtScore: a.technicalDebtScore,
        scanId: a.scanId,
      };
    });

  // Build weekly acceptance rate from scans (completed = accepted, failed = rejected)
  const weeklyMap = new Map<string, { accepted: number; rejected: number }>();
  scans.forEach((scan, i) => {
    const week = `Week ${Math.floor(i / Math.max(1, Math.ceil(scans.length / 4))) + 1}`;
    const entry = weeklyMap.get(week) ?? { accepted: 0, rejected: 0 };
    if (scan.status === "COMPLETED") entry.accepted++;
    else if (scan.status === "FAILED") entry.rejected++;
    weeklyMap.set(week, entry);
  });

  const weeklyAcceptanceRate: WeeklyRate[] = Array.from(weeklyMap.entries())
    .slice(0, 4)
    .map(([week, v]) => ({ week, ...v }));

  return {
    totalIssuesFixed,
    avgDebtScore,
    latestAvgComplexity: latest?.avgComplexity ?? 0,
    severityDistribution,
    complexityTrend,
    weeklyAcceptanceRate,
  };
};

/**
 * Builds the Reports page summary.
 */
export const buildReportSummary = (
  analytics: AnalyticsRecord[],
  scans: ScanRecord[],
): ReportSummary => {
  const latest = analytics[0] ?? null;
  const dist = (latest?.severityDistribution ?? {}) as Record<string, number>;

  const debtScore = latest?.technicalDebtScore ?? 0;
  const healthScore = debtToHealth(debtScore);

  const topRecommendations: string[] = [];
  if ((dist["CRITICAL"] ?? 0) > 0)
    topRecommendations.push(`Fix ${dist["CRITICAL"]} critical security or logic issues immediately`);
  if ((dist["HIGH"] ?? 0) > 0)
    topRecommendations.push(`Resolve ${dist["HIGH"]} high-severity code smells`);
  if ((latest?.avgComplexity ?? 0) > 15)
    topRecommendations.push("Reduce cyclomatic complexity in high-complexity files");
  if (topRecommendations.length === 0)
    topRecommendations.push("Codebase is in good health — keep scanning regularly");

  return {
    healthScore,
    issuesByStatus: {
      critical: dist["CRITICAL"] ?? 0,
      high:     dist["HIGH"]     ?? 0,
      medium:   dist["MEDIUM"]   ?? 0,
      low:      dist["LOW"]      ?? 0,
    },
    topRecommendations,
    latestScanId: latest?.scanId ?? null,
    latestScanDate: scans[0]?.scanDate ?? null,
    avgComplexity: latest?.avgComplexity ?? 0,
    debtScore,
  };
};