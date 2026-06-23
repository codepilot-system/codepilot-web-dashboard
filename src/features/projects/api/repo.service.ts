import { api } from "../../../shared/api/axiosClient";

/**
 * 1. Discover/Search Repositories (Used by useGithubRepos)
 * Maps to: GET /api/projects/discover?search=...
 */
export const fetchAvailableGithubRepos = async (
  search: string,
  page: number,
  limit: number = 5,
) => {
  const response = await api.get("/projects/discover", {
    params: { search, page, limit },
  });
  return response.data;
};

/**
 * 2. Track / Import a Repository (Used by useTrackRepository)
 * Maps perfectly to your backend controller's connection parameters
 */
export const trackRepositoryEndpoint = async (repo: any) => {
  const fullNameStr = repo.full_name || repo.fullName || "";
  const [extractedOwner, extractedRepoName] = fullNameStr.includes("/")
    ? fullNameStr.split("/")
    : [repo.owner || "", repo.name || ""];

  const payload = {
    owner: extractedOwner.trim(),
    repoName: extractedRepoName.trim(),
  };

  console.log(
    "Transmitting exact payload expected by connectProject controller:",
    payload,
  );

  const response = await api.post("/projects", payload);
  return response.data;
};
