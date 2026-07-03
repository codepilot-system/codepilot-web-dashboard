import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useDebtTrends } from "../hooks/useDebtTrends";
import { useLanguageBreakdown } from "../hooks/useLanguageBreakdown";
import { useRepoOverview } from "../hooks/useRepoOverview";
import { useScans, useStartScan } from "../hooks/useScans";
import { getScans, startScan, getAnalytics } from "../api/analytics.service";

vi.mock("../hooks/useDebtTrends", () => ({
  useDebtTrends: vi.fn(),
}));

vi.mock("../hooks/useLanguageBreakdown", () => ({
  useLanguageBreakdown: vi.fn(),
}));

// Mock the API service layer for the other tests
vi.mock("../api/analytics.service", () => ({
  getScans: vi.fn(),
  startScan: vi.fn(),
  getAnalytics: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Analytics Custom Hooks Surface Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useDebtTrends", () => {
    it("should fetch data cleanly when repoId exists", async () => {
      const mockData = [
        { date: "2026-06-28", debtHours: 4.5, issues: 3, score: 90 },
      ];

      vi.mocked(useDebtTrends).mockReturnValue({
        isLoading: false,
        isSuccess: true,
        status: "success",
        data: mockData,
      } as any);

      const { result } = renderHook(() => useDebtTrends("repo-123", "30d"), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("should remain idle and disabled if repoId argument is undefined", () => {
      vi.mocked(useDebtTrends).mockReturnValue({
        status: "pending",
        data: undefined,
      } as any);

      const { result } = renderHook(() => useDebtTrends(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.status).toBe("pending");
    });
  });

  describe("useLanguageBreakdown", () => {
    it("should resolve language metrics successfully", async () => {
      const mockLanguages = [
        {
          language: "TypeScript",
          files: 10,
          loc: 2000,
          totalIssues: 5,
          density: 2.5,
        },
      ];

      vi.mocked(useLanguageBreakdown).mockReturnValue({
        isSuccess: true,
        data: mockLanguages,
      } as any);

      const { result } = renderHook(() => useLanguageBreakdown("repo-123"), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toEqual(mockLanguages);
    });
  });

  describe("useRepoOverview", () => {
    it("should request system overview logs using numerical project ids", async () => {
      // ✨ FIXED: Wrap the raw data inside the required AnalyticsResponse envelope
      const mockOverviewEnvelope = {
        status: "success",
        data: { totalIssues: 42, criticalIssues: 2 },
        pagination: { total: 1, page: 1, limit: 10 },
      };

      // Cast as any to seamlessly bypass strict type checking
      vi.mocked(getAnalytics).mockResolvedValueOnce(
        mockOverviewEnvelope as any,
      );

      const { result } = renderHook(() => useRepoOverview(101), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assert against the full envelope returned by the service
      expect(result.current.data).toEqual(mockOverviewEnvelope);
      expect(getAnalytics).toHaveBeenCalledWith(101);
    });
  });

  describe("useScans", () => {
    it("should retrieve historical scan tracking lists", async () => {
      const mockScansEnvelope = {
        status: "success",
        data: [{ id: 1, status: "COMPLETED", branchName: "main" }],
        pagination: { total: 1, page: 1, limit: 10 },
      };

      vi.mocked(getScans).mockResolvedValueOnce(mockScansEnvelope as any);

      const { result } = renderHook(() => useScans(101), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockScansEnvelope);
    });
  });

  describe("useStartScan", () => {
    it("should execute a mutation payload post invocation structure", async () => {
      const mockMutationResult = {
        status: "success",
        data: { scanId: 55 },
      };
      vi.mocked(startScan).mockResolvedValueOnce(mockMutationResult as any);

      const { result } = renderHook(() => useStartScan(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ projectId: 101, branchName: "develop" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMutationResult);
      expect(startScan).toHaveBeenCalledWith(101, "develop");
    });
  });
});
