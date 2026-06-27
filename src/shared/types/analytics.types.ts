// // =======================================================
// // Analytics Domain Types
// // Raw shapes mirror what the backend `/analytics/*` endpoints emit.
// // Chart-ready shapes are produced by the DataTransformer layer.
// // =======================================================

// export type QualityGrade = "A" | "B" | "C" | "D" | "E" | "F";

// export type SeverityLevel =
//   | "blocker"
//   | "critical"
//   | "major"
//   | "minor"
//   | "info";

// // ---------- Raw backend payloads ----------

// export interface RepoOverviewRaw {
//   repoId: string;
//   repoName: string;
//   qualityScore: number; // 0-100
//   qualityGrade: QualityGrade;
//   totals: {
//     issues: number;
//     debtMinutes: number;
//     filesAnalyzed: number;
//     linesOfCode: number;
//   };
//   severityCounts: Record<SeverityLevel, number>;
//   lastAnalyzedAt: string; // ISO timestamp
//   scanDurationMs?: number;
// }

// export interface DebtTrendPointRaw {
//   recordedAt: string; // ISO timestamp
//   totalDebtMinutes: number;
//   totalIssues: number;
//   qualityScore: number;
// }

// export interface DebtTrendsRaw {
//   repoId: string;
//   range: string; // "7d" | "30d" | "90d"
//   points: DebtTrendPointRaw[];
// }

// export interface LanguageBreakdownEntryRaw {
//   language: string;
//   fileCount: number;
//   linesOfCode: number;
//   issuesBySeverity: Record<SeverityLevel, number>;
// }

// export interface LanguageBreakdownRaw {
//   repoId: string;
//   languages: LanguageBreakdownEntryRaw[];
// }

// // ---------- Flattened / chart-ready shapes ----------

// export interface ScorecardMetric {
//   id: string;
//   label: string;
//   value: string;
//   hint?: string;
//   tone?: "neutral" | "positive" | "warning" | "danger";
// }

// export interface DebtTrendPoint {
//   date: string; // pretty label (e.g. "Jun 12")
//   isoDate: string;
//   debtHours: number;
//   issues: number;
//   score: number;
// }

// export interface LanguageRow {
//   language: string;
//   files: number;
//   loc: number;
//   totalIssues: number;
//   density: number; // issues per 1k LOC
//   blocker: number;
//   critical: number;
//   major: number;
//   minor: number;
//   info: number;
// }

// export interface SeveritySlice {
//   severity: SeverityLevel;
//   label: string;
//   value: number;
//   percent: number; // 0-100
//   color: string;
// }

// export interface OverviewSummary {
//   repoName: string;
//   qualityScore: number;
//   qualityGrade: QualityGrade;
//   totalIssues: number;
//   totalDebtHours: number;
//   filesAnalyzed: number;
//   linesOfCode: number;
//   lastAnalyzedAt: string;
//   scorecards: ScorecardMetric[];
//   severityDistribution: SeveritySlice[];
// }

// export type AnalyticsRange = "7d" | "30d" | "90d";


// =============================================================
// Analytics Domain Types
// These mirror the backend Analytics model from prisma schema:
//   avgComplexity, technicalDebtScore, severityDistribution
//   plus the Scan model fields joined via getAnalytics()
// =============================================================

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ScanStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";
export type IssueStatus = "OPEN" | "FIXED" | "IGNORED";

// ---------- Raw backend shapes ----------

// Response from GET /analytics?projectId=N
export interface AnalyticsRecord {
  id: number;
  projectId: number;
  scanId: number;
  avgComplexity: number;
  technicalDebtScore: number;
  severityDistribution: Record<Severity, number>;
  generatedAt: string; // ISO
}

export interface AnalyticsResponse {
  status: string;
  data: AnalyticsRecord[];
  pagination: { page: number; limit: number; total: number };
}

// Response from GET /scans?projectId=N
export interface ScanRecord {
  id: number;
  projectId: number;
  initiatorId: number | null;
  branchName: string;
  commitSha: string | null;
  status: ScanStatus;
  modelUsed: string | null;
  tokensUsed: number | null;
  durationMs: number | null;
  scanDate: string; // ISO
}

export interface ScansResponse {
  status: string;
  data: ScanRecord[];
  pagination: { page: number; limit: number; total: number };
}

// ---------- Chart-ready / derived shapes ----------

export interface SeveritySlice {
  severity: Severity;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface ScorecardMetric {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone: "neutral" | "positive" | "warning" | "danger";
}

export interface ComplexityTrendPoint {
  date: string;        // display label e.g. "Jun 12"
  isoDate: string;
  avgComplexity: number;
  debtScore: number;
  scanId: number;
}

// Aggregated summary for the overview page (repo-level)
export interface RepoOverviewSummary {
  totalIssues: number;
  criticalIssues: number;
  debtScore: number;          // technicalDebtScore from latest analytics
  avgComplexity: number;      // from latest analytics
  severityDistribution: SeveritySlice[];
  scorecards: ScorecardMetric[];
  latestScanId: number | null;
  latestScanDate: string | null;
  complexityTrend: ComplexityTrendPoint[];
}

// For the Analytics dashboard page (cross-scan view)
export interface AnalyticsSummary {
  totalIssuesFixed: number;
  avgDebtScore: number;
  latestAvgComplexity: number;
  severityDistribution: SeveritySlice[];
  complexityTrend: ComplexityTrendPoint[];
  weeklyAcceptanceRate: WeeklyRate[];
}

export interface WeeklyRate {
  week: string;
  accepted: number;
  rejected: number;
}

// For the Reports page
export interface ReportSummary {
  healthScore: number;       // 0-100 derived from debtScore
  issuesByStatus: { critical: number; high: number; medium: number; low: number };
  topRecommendations: string[];
  latestScanId: number | null;
  latestScanDate: string | null;
  avgComplexity: number;
  debtScore: number;
}