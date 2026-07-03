import { api } from "../../../shared/api/axiosClient";
import type { AnalyticsResponse, ScansResponse } from "../../../shared/types/analytics.types";

// ── GET /analytics?projectId=N[&scanId=N] ──────────────────────────────────
export const getAnalytics = async (
  projectId: number,
  scanId?: number,
): Promise<AnalyticsResponse> => {
  const response = await api.get("/analytics", {
    params: { projectId, ...(scanId !== undefined && { scanId }) },
  });
  return response.data;
};

// ── GET /scans?projectId=N ─────────────────────────────────────────────────
export const getScans = async (
  projectId: number,
): Promise<ScansResponse> => {
  const response = await api.get("/scans", {
    params: { projectId },
  });
  return response.data;
};

// ── POST /scans ────────────────────────────────────────────────────────────
export const startScan = async (
  projectId: number,
  branchName: string = "main",
): Promise<{ status: string; data: any }> => {
  const response = await api.post("/scans", { projectId, branchName });
  return response.data;
};

// ── GET /scans/:scanId/report (returns PDF blob) ───────────────────────────
export const getScanReport = async (scanId: number): Promise<Blob> => {
  const response = await api.get(`/scans/${scanId}/report`, {
    responseType: "blob",
  });
  return response.data;
};


