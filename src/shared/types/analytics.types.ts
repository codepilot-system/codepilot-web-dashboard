// =======================================================
// Analytics Domain Types
// Raw shapes mirror what the backend `/analytics/*` endpoints emit.
// Chart-ready shapes are produced by the DataTransformer layer.
// =======================================================

export type QualityGrade = "A" | "B" | "C" | "D" | "E" | "F";

export type SeverityLevel =
  | "blocker"
  | "critical"
  | "major"
  | "minor"
  | "info";

// ---------- Raw backend payloads ----------

export interface RepoOverviewRaw {
  repoId: string;
  repoName: string;
  qualityScore: number; // 0-100
  qualityGrade: QualityGrade;
  totals: {
    issues: number;
    debtMinutes: number;
    filesAnalyzed: number;
    linesOfCode: number;
  };
  severityCounts: Record<SeverityLevel, number>;
  lastAnalyzedAt: string; // ISO timestamp
  scanDurationMs?: number;
}

export interface DebtTrendPointRaw {
  recordedAt: string; // ISO timestamp
  totalDebtMinutes: number;
  totalIssues: number;
  qualityScore: number;
}

export interface DebtTrendsRaw {
  repoId: string;
  range: string; // "7d" | "30d" | "90d"
  points: DebtTrendPointRaw[];
}

export interface LanguageBreakdownEntryRaw {
  language: string;
  fileCount: number;
  linesOfCode: number;
  issuesBySeverity: Record<SeverityLevel, number>;
}

export interface LanguageBreakdownRaw {
  repoId: string;
  languages: LanguageBreakdownEntryRaw[];
}

// ---------- Flattened / chart-ready shapes ----------

export interface ScorecardMetric {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
}

export interface DebtTrendPoint {
  date: string; // pretty label (e.g. "Jun 12")
  isoDate: string;
  debtHours: number;
  issues: number;
  score: number;
}

export interface LanguageRow {
  language: string;
  files: number;
  loc: number;
  totalIssues: number;
  density: number; // issues per 1k LOC
  blocker: number;
  critical: number;
  major: number;
  minor: number;
  info: number;
}

export interface SeveritySlice {
  severity: SeverityLevel;
  label: string;
  value: number;
  percent: number; // 0-100
  color: string;
}

export interface OverviewSummary {
  repoName: string;
  qualityScore: number;
  qualityGrade: QualityGrade;
  totalIssues: number;
  totalDebtHours: number;
  filesAnalyzed: number;
  linesOfCode: number;
  lastAnalyzedAt: string;
  scorecards: ScorecardMetric[];
  severityDistribution: SeveritySlice[];
}

export type AnalyticsRange = "7d" | "30d" | "90d";
