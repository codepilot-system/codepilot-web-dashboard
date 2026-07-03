import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAnalytics,
  startScan,
  getScanReport,
} from "../api/analytics.service";
import { api } from "../../../shared/api/axiosClient";

// Mock the centralized Axios instance
vi.mock("../../../shared/api/axiosClient", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Analytics API Service Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should retrieve basic analytics data for a selected project ID", async () => {
    const mockResponse = { data: { healthScore: 85 } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    const result = await getAnalytics(12);

    expect(api.get).toHaveBeenCalledWith("/analytics", {
      params: { projectId: 12 },
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("should conditionally inject structural scanId criteria when provided", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await getAnalytics(12, 99);

    expect(api.get).toHaveBeenCalledWith("/analytics", {
      params: { projectId: 12, scanId: 99 },
    });
  });

  it("should issue structured scan dispatch tracks via POST targets", async () => {
    const mockResponse = { data: { status: "queued", data: {} } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await startScan(45, "development");

    expect(api.post).toHaveBeenCalledWith("/scans", {
      projectId: 45,
      branchName: "development",
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("should capture binary reporting buffers using standard configuration options", async () => {
    const mockBlob = new Blob(["pdf content"], { type: "application/pdf" });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockBlob });

    const result = await getScanReport(501);

    expect(api.get).toHaveBeenCalledWith("/scans/501/report", {
      responseType: "blob",
    });
    expect(result).toBe(mockBlob);
  });
});
