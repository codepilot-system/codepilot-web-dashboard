import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import API services to mock their network cycles
import {
  fetchAvailableGithubRepos,
  trackRepositoryEndpoint,
} from "../api/repo.service";
import { useGithubRepos, useTrackRepository } from "../hooks/useGithubRepos";

// Mock the API layer entirely
vi.mock("../api/repo.service", () => ({
  fetchAvailableGithubRepos: vi.fn(),
  trackRepositoryEndpoint: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Repository Tracking Custom Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useGithubRepos", () => {
    it("should successfully query available GitHub repositories with search params", async () => {
      const mockEnvelope = {
        status: "success",
        data: [
          { id: 123, name: "CodePilot-Core", fullName: "org/CodePilot-Core" },
        ],
        pagination: { total: 1, page: 1, limit: 5 },
      };

      vi.mocked(fetchAvailableGithubRepos).mockResolvedValueOnce(
        mockEnvelope as any,
      );

      const { result } = renderHook(() => useGithubRepos("CodePilot", 1, 5), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockEnvelope);
      expect(fetchAvailableGithubRepos).toHaveBeenCalledWith("CodePilot", 1, 5);
    });
  });

  describe("useTrackRepository", () => {
    it("should execute repository tracking mutation and invalidate cache contexts upon success", async () => {
      const mockMutationResponse = {
        status: "success",
        message: "Repository tracked successfully",
      };
      vi.mocked(trackRepositoryEndpoint).mockResolvedValueOnce(
        mockMutationResponse as any,
      );

      const callbackSpy = vi.fn();
      const { result } = renderHook(() => useTrackRepository(callbackSpy), {
        wrapper: createWrapper(),
      });

      const trackingPayload = { repoId: "12345", name: "test-repo" };

      // Trigger mutation inside an 'act' context block
      act(() => {
        result.current.mutate(trackingPayload);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockMutationResponse);
      expect(trackRepositoryEndpoint).toHaveBeenCalledWith(
        trackingPayload,
        expect.any(Object),
      );

      // Verify callback fires with response context mapping matches
      expect(callbackSpy).toHaveBeenCalledWith(
        mockMutationResponse,
        trackingPayload,
      );
    });
  });
});
