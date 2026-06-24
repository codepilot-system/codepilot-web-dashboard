// =======================================================
// Centralised TanStack Query cache lifetime tuning.
// Keeping these constants in one place lets us tweak chatter
// behaviour across the whole analytics surface from a single seam.
// =======================================================

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/**
 * Per-query cache profile.
 * `staleTime`: window during which cached data is considered fresh and
 *              re-renders / tab swaps will NOT trigger a refetch.
 * `gcTime`:    how long unused data lingers in the cache before GC.
 * `refetchInterval`: optional polling for "live-ish" panels.
 */
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
