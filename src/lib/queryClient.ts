import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // 4xx não melhora com retry
        if (isAxiosError(error) && error.response && error.response.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
