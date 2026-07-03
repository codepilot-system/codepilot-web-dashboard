const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const analyticsCacheConfig = {
  overview: {
    staleTime: 2 * MINUTE,
    gcTime: 10 * MINUTE,
    refetchInterval: 5 * MINUTE, // soft background heartbeat
    refetchIntervalInBackground: false,
  },
  debtTrends: {
    staleTime: 5 * MINUTE,
    gcTime: 30 * MINUTE,
    // History rarely changes mid-session; no polling needed.
  },
  languageBreakdown: {
    staleTime: 10 * MINUTE,
    gcTime: 30 * MINUTE,
  },
} as const;
