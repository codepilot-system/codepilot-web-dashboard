import { format, parseISO } from "date-fns";
import {
  DebtTrendPoint,
  DebtTrendsRaw,
  LanguageBreakdownRaw,
  LanguageRow,
  OverviewSummary,
  QualityGrade,
  RepoOverviewRaw,
  ScorecardMetric,
  SeverityLevel,
  SeveritySlice,
} from "../../../shared/types/analytics.types";

// ===============================================================
// DataTransformer
// Pure, side-effect-free functions that flatten deeply nested
// backend payloads into chart/table-ready shapes. These run inside
// TanStack Query's `select` so memoization happens for free.
// ===============================================================

const SEVERITY_ORDER: SeverityLevel[] = [
  "blocker",
  "critical",
  "major",
  "minor",
  "info",
];

const SEVERITY_PALETTE: Record<SeverityLevel, string> = {
  blocker: "#ef4444", // red-500
  critical: "#f97316", // orange-500
  major: "#eab308", // yellow-500
  minor: "#3b82f6", // blue-500
  info: "#64748b", // slate-500
};

const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  blocker: "Blocker",
  critical: "Critical",
  major: "Major",
  minor: "Minor",
  info: "Info",
};

const GRADE_TONE: Record<QualityGrade, ScorecardMetric["tone"]> = {
  A: "positive",
  B: "positive",
  C: "neutral",
  D: "warning",
  E: "warning",
  F: "danger",
};

// ---------- helpers ----------

const minutesToHours = (minutes: number): number =>
  Math.round((minutes / 60) * 10) / 10;

const safeFormat = (iso: string, pattern: string): string => {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
};

const computePercentages = (
  counts: Record<SeverityLevel, number>,
): SeveritySlice[] => {
  const total = SEVERITY_ORDER.reduce((sum, k) => sum + (counts[k] ?? 0), 0);
  return SEVERITY_ORDER.map((severity) => {
    const value = counts[severity] ?? 0;
    const percent = total === 0 ? 0 : Math.round((value / total) * 1000) / 10;
    return {
      severity,
      label: SEVERITY_LABEL[severity],
      value,
      percent,
      color: SEVERITY_PALETTE[severity],
    };
  });
};

// ---------- transformers ----------

export const transformRepoOverview = (
  raw: RepoOverviewRaw,
): OverviewSummary => {
  const totalDebtHours = minutesToHours(raw.totals.debtMinutes);

  const scorecards: ScorecardMetric[] = [
    {
      id: "grade",
      label: "Quality Grade",
      value: raw.qualityGrade,
      hint: `Score ${raw.qualityScore}/100`,
      tone: GRADE_TONE[raw.qualityGrade],
    },
    {
      id: "issues",
      label: "Total Issues",
      value: raw.totals.issues.toLocaleString(),
      hint: `${raw.severityCounts.blocker ?? 0} blockers`,
      tone: raw.totals.issues > 0 ? "warning" : "positive",
    },
    {
      id: "debt",
      label: "Technical Debt",
      value: `${totalDebtHours}h`,
      hint: "Estimated remediation time",
      tone: totalDebtHours > 40 ? "danger" : "neutral",
    },
    {
      id: "files",
      label: "Files Analyzed",
      value: raw.totals.filesAnalyzed.toLocaleString(),
      hint: `${raw.totals.linesOfCode.toLocaleString()} LOC`,
      tone: "neutral",
    },
  ];

  return {
    repoName: raw.repoName,
    qualityScore: raw.qualityScore,
    qualityGrade: raw.qualityGrade,
    totalIssues: raw.totals.issues,
    totalDebtHours,
    filesAnalyzed: raw.totals.filesAnalyzed,
    linesOfCode: raw.totals.linesOfCode,
    lastAnalyzedAt: raw.lastAnalyzedAt,
    scorecards,
    severityDistribution: computePercentages(raw.severityCounts),
  };
};

export const transformDebtTrends = (raw: DebtTrendsRaw): DebtTrendPoint[] => {
  // Sort chronologically just in case the backend emits them unordered.
  const sorted = [...raw.points].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  return sorted.map((point) => ({
    date: safeFormat(point.recordedAt, "MMM d"),
    isoDate: point.recordedAt,
    debtHours: minutesToHours(point.totalDebtMinutes),
    issues: point.totalIssues,
    score: point.qualityScore,
  }));
};

export const transformLanguageBreakdown = (
  raw: LanguageBreakdownRaw,
): LanguageRow[] => {
  const rows: LanguageRow[] = raw.languages.map((entry) => {
    const sev = entry.issuesBySeverity;
    const totalIssues = SEVERITY_ORDER.reduce(
      (acc, key) => acc + (sev[key] ?? 0),
      0,
    );
    const density =
      entry.linesOfCode === 0
        ? 0
        : Math.round((totalIssues / entry.linesOfCode) * 1000 * 10) / 10;

    return {
      language: entry.language,
      files: entry.fileCount,
      loc: entry.linesOfCode,
      totalIssues,
      density,
      blocker: sev.blocker ?? 0,
      critical: sev.critical ?? 0,
      major: sev.major ?? 0,
      minor: sev.minor ?? 0,
      info: sev.info ?? 0,
    };
  });

  // Surface the noisiest languages first.
  return rows.sort((a, b) => b.totalIssues - a.totalIssues);
};

// Exposed for components that need the shared palette/labels.
export const severityPalette = SEVERITY_PALETTE;
export const severityLabel = SEVERITY_LABEL;
export const severityOrder = SEVERITY_ORDER;
