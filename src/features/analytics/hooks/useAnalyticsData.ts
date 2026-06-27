// // src/features/analytics/hooks/useAnalyticsData.ts
// //
// // Single file for all data hooks used by the 3 pages.
// // Each hook hits the real backend and transforms the response.

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getAnalytics, getScans, startScan } from "../api/analytics.service";
// import {
//   buildRepoOverviewSummary,
//   buildAnalyticsSummary,
//   buildReportSummary,
// } from "../utils/dataTransformer";
// import type {
//   RepoOverviewSummary,
//   AnalyticsSummary,
//   ReportSummary,
// } from "../../../shared/types/analytics.types";

// // ── useRepoOverview ────────────────────────────────────────────────────────
// // Used by: Overview (repo detail) page
// // Fetches the latest analytics + scans and builds the overview summary.
// export const useRepoOverview = (projectId: number | null) => {
//   return useQuery<RepoOverviewSummary>({
//     queryKey: ["repoOverview", projectId],
//     queryFn: async () => {
//       const [analyticsRes, scansRes] = await Promise.all([
//         getAnalytics(projectId!),
//         getScans(projectId!),
//       ]);
//       return buildRepoOverviewSummary(analyticsRes.data, scansRes.data);
//     },
//     enabled: projectId !== null && projectId > 0,
//     staleTime: 2 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });
// };

// // ── useAnalyticsDashboard ──────────────────────────────────────────────────
// // Used by: Analytics page
// // Fetches all analytics records and builds the analytics summary.
// export const useAnalyticsDashboard = (projectId: number | null) => {
//   return useQuery<AnalyticsSummary>({
//     queryKey: ["analyticsDashboard", projectId],
//     queryFn: async () => {
//       const [analyticsRes, scansRes] = await Promise.all([
//         getAnalytics(projectId!),
//         getScans(projectId!),
//       ]);
//       return buildAnalyticsSummary(analyticsRes.data, scansRes.data);
//     },
//     enabled: projectId !== null && projectId > 0,
//     staleTime: 2 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });
// };

// // ── useReportSummary ───────────────────────────────────────────────────────
// // Used by: Reports page
// // Builds the preview data for the report configuration panel.
// export const useReportSummary = (projectId: number | null) => {
//   return useQuery<ReportSummary>({
//     queryKey: ["reportSummary", projectId],
//     queryFn: async () => {
//       const [analyticsRes, scansRes] = await Promise.all([
//         getAnalytics(projectId!),
//         getScans(projectId!),
//       ]);
//       return buildReportSummary(analyticsRes.data, scansRes.data);
//     },
//     enabled: projectId !== null && projectId > 0,
//     staleTime: 2 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });
// };

// // ── useScans ───────────────────────────────────────────────────────────────
// // Used by: All pages (scan status, rescan button)
// export const useScans = (projectId: number | null) => {
//   return useQuery({
//     queryKey: ["scans", projectId],
//     queryFn: () => getScans(projectId!),
//     enabled: projectId !== null && projectId > 0,
//     staleTime: 30 * 1000, // 30s — scans change fast
//     gcTime: 5 * 60 * 1000,
//     refetchInterval: (query) => {
//       // Poll every 5s while a scan is in progress
//       const scans = query.state.data?.data ?? [];
//       const hasInProgress = scans.some((s) => s.status === "IN_PROGRESS");
//       return hasInProgress ? 5000 : false;
//     },
//   });
// };

// // ── useStartScan ───────────────────────────────────────────────────────────
// // Used by: Overview page Rescan button
// export const useStartScan = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       projectId,
//       branchName,
//     }: {
//       projectId: number;
//       branchName: string;
//     }) => startScan(projectId, branchName),
//     onSuccess: (_, { projectId }) => {
//       // Invalidate so all pages refetch fresh data after scan starts
//       queryClient.invalidateQueries({ queryKey: ["scans", projectId] });
//       queryClient.invalidateQueries({ queryKey: ["repoOverview", projectId] });
//       queryClient.invalidateQueries({ queryKey: ["analyticsDashboard", projectId] });
//       queryClient.invalidateQueries({ queryKey: ["reportSummary", projectId] });
//     },
//   });
// };




// src/features/analytics/hooks/useAnalyticsData.ts
//
// Single file for all data hooks used by the 3 pages.
// Each hook hits the real backend and transforms the response.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAnalytics, getScans, startScan } from "../api/analytics.service";
import {
  buildRepoOverviewSummary,
  buildAnalyticsSummary,
  buildReportSummary,
} from "../utils/dataTransformer";
import type {
  RepoOverviewSummary,
  AnalyticsSummary,
  ReportSummary,
} from "../../../shared/types/analytics.types";

// ── useRepoOverview ────────────────────────────────────────────────────────
// Used by: Overview (repo detail) page
// Fetches the latest analytics + scans and builds the overview summary.
export const useRepoOverview = (projectId: number | null) => {
  return useQuery<RepoOverviewSummary>({
    queryKey: ["repoOverview", projectId],
    queryFn: async () => {
      const [analyticsRes, scansRes] = await Promise.all([
        getAnalytics(projectId!),
        getScans(projectId!),
      ]);
      return buildRepoOverviewSummary(analyticsRes.data, scansRes.data);
    },
    enabled: projectId !== null && projectId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ── useAnalyticsDashboard ──────────────────────────────────────────────────
// Used by: Analytics page
// Fetches all analytics records and builds the analytics summary.
export const useAnalyticsDashboard = (projectId: number | null) => {
  return useQuery<AnalyticsSummary>({
    queryKey: ["analyticsDashboard", projectId],
    queryFn: async () => {
      const [analyticsRes, scansRes] = await Promise.all([
        getAnalytics(projectId!),
        getScans(projectId!),
      ]);
      return buildAnalyticsSummary(analyticsRes.data, scansRes.data);
    },
    enabled: projectId !== null && projectId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ── useReportSummary ───────────────────────────────────────────────────────
// Used by: Reports page
// Builds the preview data for the report configuration panel.
export const useReportSummary = (projectId: number | null) => {
  return useQuery<ReportSummary>({
    queryKey: ["reportSummary", projectId],
    queryFn: async () => {
      const [analyticsRes, scansRes] = await Promise.all([
        getAnalytics(projectId!),
        getScans(projectId!),
      ]);
      return buildReportSummary(analyticsRes.data, scansRes.data);
    },
    enabled: projectId !== null && projectId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ── useScans ───────────────────────────────────────────────────────────────
// Used by: All pages (scan status, rescan button)
export const useScans = (projectId: number | null) => {
  return useQuery({
    queryKey: ["scans", projectId],
    queryFn: () => getScans(projectId!),
    enabled: projectId !== null && projectId > 0,
    staleTime: 30 * 1000, // 30s — scans change fast
    gcTime: 5 * 60 * 1000,
    refetchInterval: (query) => {
      // Poll every 5s while a scan is in progress
      const scans = query.state.data?.data ?? [];
      const hasInProgress = scans.some((s) => s.status === "IN_PROGRESS");
      return hasInProgress ? 5000 : false;
    },
  });
};

// ── useStartScan ───────────────────────────────────────────────────────────
// Used by: Overview page Rescan button
export const useStartScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      branchName,
    }: {
      projectId: number;
      branchName: string;
    }) => startScan(projectId, branchName),
    onSuccess: (_, { projectId }) => {
      // Invalidate so all pages refetch fresh data after scan starts
      queryClient.invalidateQueries({ queryKey: ["scans", projectId] });
      queryClient.invalidateQueries({ queryKey: ["repoOverview", projectId] });
      queryClient.invalidateQueries({ queryKey: ["analyticsDashboard", projectId] });
      queryClient.invalidateQueries({ queryKey: ["reportSummary", projectId] });
    },
  });
};






