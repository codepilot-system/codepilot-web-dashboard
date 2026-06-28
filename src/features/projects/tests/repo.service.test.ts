import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAvailableGithubRepos,
  trackRepositoryEndpoint,
} from "../api/repo.service";
import { api } from "../../../shared/api/axiosClient";

vi.mock("../../../shared/api/axiosClient", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("GitHub Repository API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should format pagination and query terms correctly during repository search", async () => {
    const mockData = { data: [{ id: 1, name: "test-repo" }] };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

    const result = await fetchAvailableGithubRepos("demo", 2, 5);

    expect(api.get).toHaveBeenCalledWith("/projects/discover", {
      params: { search: "demo", page: 2, limit: 5 },
    });
    expect(result).toEqual(mockData);
  });

  it("should split a slash-separated full_name string correctly into owner and repoName", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });
    const mockRepo = { full_name: "Nada125/CodePilot-Core" };

    await trackRepositoryEndpoint(mockRepo);

    expect(api.post).toHaveBeenCalledWith("/projects", {
      owner: "Nada125",
      repoName: "CodePilot-Core",
    });
  });

  it("should fallback to individual owner and name fields if no slash exists in full_name", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });
    const mockRepo = { owner: "Cairo-Univ", name: "AI-Parser" };

    await trackRepositoryEndpoint(mockRepo);

    expect(api.post).toHaveBeenCalledWith("/projects", {
      owner: "Cairo-Univ",
      repoName: "AI-Parser",
    });
  });
});
