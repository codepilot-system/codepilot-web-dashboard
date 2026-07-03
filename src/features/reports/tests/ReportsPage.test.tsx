import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportsPage from "../../reports/pages/ReportsPage";
import { useProject } from "../../projects/context/ProjectContext";
import { useReportSummary } from "../../analytics/hooks/useAnalyticsData";

// 1. Structural hook configurations mocking
vi.mock("../../projects/context/ProjectContext", () => ({
  useProject: vi.fn(),
}));

vi.mock("../../analytics/hooks/useAnalyticsData", () => ({
  useReportSummary: vi.fn(),
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

  it("should open a printable report window on download click", async () => {
    (useProject as any).mockReturnValue(mockProjectContext);
    (useReportSummary as any).mockReturnValue({
      data: mockReportData,
      isLoading: false,
      error: null,
    });

    // The page builds an HTML report and opens it in a new window that
    // auto-triggers window.print(). Mock window.open to capture the output.
    const fakeWin = {
      document: { write: vi.fn(), close: vi.fn() },
    };
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValue(fakeWin as unknown as Window);

    render(<ReportsPage />);

    const downloadButtons = screen.getAllByRole("button", {
      name: /Download PDF/i,
    });
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalled();
      expect(fakeWin.document.write).toHaveBeenCalled();
    });

    const writtenHtml = fakeWin.document.write.mock.calls[0][0] as string;
    expect(writtenHtml).toContain("82");

    openSpy.mockRestore();
  });
});
