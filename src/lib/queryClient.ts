import { QueryClient } from "@tanstack/react-query";

/**
 * Query stale time configurations for different data types
 */
export const QUERY_STALE_TIME = {
  REALTIME: 30 * 1000, // 30 seconds

  SHORT: 1 * 60 * 1000, // 1 minute

  MEDIUM: 5 * 60 * 1000, // 5 minutes

  LONG: 15 * 60 * 1000, // 15 minutes
} as const;

/**
 * Global singleton QueryClient instance
 * Shared across all pages to maintain consistent cache
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME.SHORT,

      refetchOnWindowFocus: false,

      // Retry once on error
      retry: 1,

      gcTime: 10 * 60 * 1000,

      refetchOnMount: true,

      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,

      networkMode: 'online' as const,
    },
  },
});
