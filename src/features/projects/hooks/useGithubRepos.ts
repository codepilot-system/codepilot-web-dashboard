import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAvailableGithubRepos,
  trackRepositoryEndpoint,
} from "../api/repo.service";

export const useGithubRepos = (
  searchTerm: string,
  page: number,
  limit: number = 5,
) => {
  return useQuery({
    queryKey: ["githubRepos", searchTerm, page],
    queryFn: () => fetchAvailableGithubRepos(searchTerm, page, limit),
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    placeholderData: (previousData) => previousData, // Keeps UI smooth during transitions
  });
};

export const useTrackRepository = (
  onSuccessCallback: (response: any, variables: any) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trackRepositoryEndpoint,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["githubRepos"] });
      queryClient.invalidateQueries({ queryKey: ["trackedProjects"] });
      onSuccessCallback(response, variables);
    },
  });
};
