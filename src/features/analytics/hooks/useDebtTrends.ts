import { useQuery } from "@tanstack/react-query";
import { fetchDebtTrends } from "../api/analytics.service";
import { transformDebtTrends } from "../utils/dataTransformer";
import { analyticsCacheConfig } from "../utils/cacheConfig";
import {
  AnalyticsRange,
  DebtTrendPoint,
} from "../../../shared/types/analytics.types";

export const useDebtTrends = (
  repoId: string | undefined,
  range: AnalyticsRange = "30d",
) => {
  return useQuery<DebtTrendPoint[]>({
    queryKey: ["debtTrends", repoId, range],
    queryFn: async () => {
      const raw = await fetchDebtTrends(repoId as string, range);
      return transformDebtTrends(raw);
    },
    enabled: Boolean(repoId),
    ...analyticsCacheConfig.debtTrends,
  });
};
