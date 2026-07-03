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