import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { OverviewPage } from "../pages/OverviewPage";
import { useProject } from "../../projects/context/ProjectContext";
import {
  useRepoOverview,
  useStartScan,
  useScans,
} from "../../analytics/hooks/useAnalyticsData";
import { useQuery } from "@tanstack/react-query";

// 1. Mock custom state contexts and operational hook functions
vi.mock("../../projects/context/ProjectContext", () => ({
  useProject: vi.fn(),
}));

vi.mock("../../analytics/hooks/useAnalyticsData", () => ({
  useRepoOverview: vi.fn(),
  useStartScan: vi.fn(),
  useScans: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

// Mock Recharts fully so its rendering calculation loops don't cause window resize errors in the test console
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div data-testid="pie-cell" />,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Line: () => <div data-testid="line-element" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe("OverviewPage Core Analytics Dashboard Interface", () => {
  const mockProjectContext = {
    activeProject: {
      id: "202",
      repoName: "CodePilot-Core",
      owner: "CairoUniv-FCAI",
    },
  };

  const mockOverviewData = {
    totalIssues: 27,
    criticalIssues: 3,
    debtScore: 45,
    avgComplexity: 6.8,
    complexityTrend: [
      { date: "2026-06-20", avgComplexity: 5.2 },
      { date: "2026-06-25", avgComplexity: 6.8 },
    ],
    severityDistribution: [
      { severity: "CRITICAL", count: 3, color: "#ef4444", label: "Critical" },
      { severity: "HIGH", count: 8, color: "#f97316", label: "High" },
    ],
  };

  const mockScansData = {
    data: [{ id: 99, status: "COMPLETED", branchName: "main" }],
  };

  const mockIssuesData = {
    data: [
      {
        id: "ish-01",
        filePath: "src/backend/controllers/authController.ts",
        lineNumber: 42,
        category: "Complexity",
        severity: "CRITICAL",
      },
    ],
  };

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup active mock tracking values using the direct casting strategy
    (useProject as any).mockReturnValue(mockProjectContext);
    (useRepoOverview as any).mockReturnValue({
      data: mockOverviewData,
      isLoading: false,
      error: null,
    });
    (useScans as any).mockReturnValue({ data: mockScansData });
    (useStartScan as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    (useQuery as any).mockReturnValue({ data: mockIssuesData });
  });

  it("should show structural placeholder message if no workspace project tracking matrix is active", () => {
    (useProject as any).mockReturnValue({ activeProject: null });

    render(<OverviewPage />);

    expect(
      screen.getByText(
        /Select a project from the dropdown to view its overview/i,
      ),
    ).toBeInTheDocument();
  });

  it("should output structural pulsating skeleton grids when data loading states are active", () => {
    (useRepoOverview as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { container } = render(<OverviewPage />);

    // Checks if parent shell correctly receives Tailwind's animate-pulse class
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should manifest error card modules if incoming analytics responses fail completely", () => {
    (useRepoOverview as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Server Crash"),
    });

    render(<OverviewPage />);

    expect(
      screen.getByText(
        /Failed to load analytics. Make sure at least one scan has completed/i,
      ),
    ).toBeInTheDocument();
  });

  it("should accurately capture data and map stat dashboard values on successful response layers", () => {
    render(<OverviewPage />);

    // Verify main repository identity parameters
    expect(screen.getByText("CodePilot-Core")).toBeInTheDocument();
    expect(
      screen.getByText("CairoUniv-FCAI/CodePilot-Core"),
    ).toBeInTheDocument();

    // Verify Stat Card outputs
    expect(screen.getByText("27")).toBeInTheDocument(); // Total issues
    expect(screen.getByText("3")).toBeInTheDocument(); // Critical issues
    expect(screen.getByText("45")).toBeInTheDocument(); // Debt score

    // ✨ FIXED: Target the complexity value safely even though it matches multiple text locations
    const complexityElements = screen.getAllByText("6.8");
    expect(complexityElements.length).toBeGreaterThanOrEqual(1);
    expect(complexityElements[0]).toBeInTheDocument();

    // Verify AI insights dynamically populated string evaluation
    expect(
      screen.getByText(
        /Your codebase shows an average cyclomatic complexity of/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 critical issues/i)).toBeInTheDocument();
    expect(screen.getByText(/need immediate attention/i)).toBeInTheDocument();

    // Verify Top Complex File parameters
    expect(
      screen.getByText("src/backend/controllers/authController.ts"),
    ).toBeInTheDocument();
    expect(screen.getByText("Line 42 · Complexity")).toBeInTheDocument();
  });

  it("should execute repository re-scans with user selected branch definitions", () => {
    render(<OverviewPage />);

    // Target branch selector element node
    const branchSelector = screen.getByRole("combobox");
    fireEvent.change(branchSelector, { target: { value: "develop" } });

    // Target the Rescan operational action button element
    const rescanButton = screen.getByRole("button", { name: /Rescan/i });
    fireEvent.click(rescanButton);

    expect(mockMutate).toHaveBeenCalledWith({
      projectId: 202,
      branchName: "develop",
    });
  });

  it("should disable action items during active automated asynchronous scan executions", () => {
    (useStartScan as any).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<OverviewPage />);

    const loadingRescanButton = screen.getByRole("button", {
      name: /Scanning…/i,
    });
    expect(loadingRescanButton).toBeDisabled();
  });
});
