import { useQuery } from "@tanstack/react-query";
import { fetchLanguageBreakdown } from "../api/analytics.service";
import { transformLanguageBreakdown } from "../utils/dataTransformer";
import { analyticsCacheConfig } from "../utils/cacheConfig";
import { LanguageRow } from "../../../shared/types/analytics.types";

export const useLanguageBreakdown = (repoId: string | undefined) => {
  return useQuery<LanguageRow[]>({
    queryKey: ["languageBreakdown", repoId],
    queryFn: async () => {
      const raw = await fetchLanguageBreakdown(repoId as string);
      return transformLanguageBreakdown(raw);
    },
    enabled: Boolean(repoId),
    ...analyticsCacheConfig.languageBreakdown,
  });
};
