import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportsPage from "../../reports/pages/ReportsPage";
import { useProject } from "../../projects/context/ProjectContext";
import { useReportSummary } from "../../analytics/hooks/useAnalyticsData";
import { getScanReport } from "../../analytics/api/analytics.service";

// 1. Structural hook configurations mocking
vi.mock("../../projects/context/ProjectContext", () => ({
  useProject: vi.fn(),
}));

vi.mock("../../analytics/hooks/useAnalyticsData", () => ({
  useReportSummary: vi.fn(),
}));

vi.mock("../../analytics/api/analytics.service", () => ({
  getScanReport: vi.fn(),
}));

describe("ReportsPage Interactive Component Interface", () => {
  const mockProjectContext = {
    activeProject: {
      id: "101",
      repoName: "codepilot-core",
      owner: "Nada125",
      name: "codepilot-core",
    },
  };

  const mockReportData = {
    latestScanId: 55,
    healthScore: 82,
    latestScanDate: "2026-06-25T12:00:00.000Z",
    issuesByStatus: { critical: 2, high: 4, medium: 10, low: 15 },
    avgComplexity: 4.2,
    debtScore: 12,
    topRecommendations: [
      "Refactor layout dependencies",
      "Sanitize inputs block models",
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Polyfill URL methods window object definitions for binary blobs interactions
    window.URL.createObjectURL = vi.fn(() => "mock-blob-url");
    window.URL.revokeObjectURL = vi.fn();
  });

  it("should request user workspace configurations when active project tracking matrix is null", () => {
    (useProject as any).mockReturnValue({ activeProject: null });
    (useReportSummary as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<ReportsPage />);

    expect(
      screen.getByText(/Select a project to generate and export reports/i),
    ).toBeInTheDocument();
  });

  it("should render incoming asynchronous analytics state reports preview metrics", () => {
    (useProject as any).mockReturnValue(mockProjectContext);
    (useReportSummary as any).mockReturnValue({
      data: mockReportData,
      isLoading: false,
      error: null,
    });

    render(<ReportsPage />);

    expect(screen.getByText("Health Score: 82/100")).toBeInTheDocument();
    expect(
      screen.getByText("Your codebase is in good health."),
    ).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(
      screen.getByText("Refactor layout dependencies"),
    ).toBeInTheDocument();
  });

  it("should allow interactive toggling of option checkmarks inside config checklist items", () => {
    (useProject as any).mockReturnValue(mockProjectContext);
    (useReportSummary as any).mockReturnValue({
      data: mockReportData,
      isLoading: false,
      error: null,
    });

    render(<ReportsPage />);

    const executiveSummaryItem = screen.getByText("Executive Summary");

    // Toggle element off
    fireEvent.click(executiveSummaryItem);
    // Toggle element back on
    fireEvent.click(executiveSummaryItem);
  });

  it("should execute binary report compilation and handle client download actions on click", async () => {
    (useProject as any).mockReturnValue(mockProjectContext);
    (useReportSummary as any).mockReturnValue({
      data: mockReportData,
      isLoading: false,
      error: null,
    });

    const fakeBlob = new Blob(["contents"], { type: "application/pdf" });
    (getScanReport as any).mockResolvedValueOnce(fakeBlob);

    render(<ReportsPage />);

    const downloadButtons = screen.getAllByRole("button", {
      name: /Download PDF/i,
    });
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(getScanReport).toHaveBeenCalledWith(55);
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
    });
  });
});
