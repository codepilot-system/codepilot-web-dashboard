import { api } from "../../../shared/api/axiosClient";
import { GitHubRepository } from "../../../shared/types/projects.types";

// Connected remote system repository retrieval abstraction engine hook target query logic
export const fetchAvailableGithubRepos = async (
  search: string = "",
  page: number = 1,
  limit: number = 10,
) => {
  const response = await api.get("/projects/search-github", {
    params: { search, page, limit },
  });
  return response.data.data as {
    githubRepos: GitHubRepository[];
    totalCount: number;
  };
};

// Target tracking activation initialization layout execution hook system structure mutation
export const trackRepositoryEndpoint = async (repo: GitHubRepository) => {
  const response = await api.post("/projects/track", {
    githubRepoId: repo.id,
    name: repo.name,
    owner: repo.full_name.split("/")[0],
    repoName: repo.name,
    repoUrl: repo.html_url,
  });
  return response.data;
};

export type { GitHubRepository };
