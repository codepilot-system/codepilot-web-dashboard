import { describe, it, expect, vi, beforeEach } from "vitest";
import { issuesService, IssueFilters } from "../api/issues.service"; // Adjust path to match your exact file name
import { api } from "../../../shared/api/axiosClient";

vi.mock("../../../shared/api/axiosClient", () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Codebase Issues Analysis Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should strip out undefined and empty string fields from analytical filters object parameters", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } });

    const messyFilters: IssueFilters = {
      projectId: "proj-101",
      severity: "CRITICAL",
      status: undefined, // Should be omitted
      search: "", // Should be omitted
    };

    await issuesService.getAll(messyFilters);

    expect(api.get).toHaveBeenCalledWith("/issues", {
      params: {
        projectId: "proj-101",
        severity: "CRITICAL",
      },
    });
  });

  it("should parse deep object responses correctly when fetching single issues by ID", async () => {
    const mockIssue = {
      id: "issue-88",
      title: "Memory leak in runtime tracking bounds",
    };
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockIssue } });

    const result = await issuesService.getById("issue-88");

    expect(api.get).toHaveBeenCalledWith("/issues/issue-88");
    expect(result).toEqual(mockIssue);
  });

  it("should execute status mutations using PATCH payloads", async () => {
    const mockUpdatedIssue = { id: "issue-88", status: "IN_PROGRESS" };
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: { data: mockUpdatedIssue },
    });

    const result = await issuesService.updateStatus("issue-88", "IN_PROGRESS");

    expect(api.patch).toHaveBeenCalledWith("/issues/issue-88", {
      status: "IN_PROGRESS",
    });
    expect(result).toEqual(mockUpdatedIssue);
  });

  it("should issue an execution post command when applying an AI generated code suggestion", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ status: 200 });

    await issuesService.applySuggestion(88);

    expect(api.post).toHaveBeenCalledWith("/suggestions/88/apply");
  });
});
