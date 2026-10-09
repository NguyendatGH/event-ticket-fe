import { QueryClient } from "@tanstack/react-query";

const shouldRetry = (failureCount, error) => {
  const s = error?.status;
  if (s && s >= 400 && s < 500 && s !== 408 && s !== 429) return false;
  return failureCount < 2;
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
