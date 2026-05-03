import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetch = useCallback((key, fn, options) => {
    return queryClient.prefetchQuery({
      queryKey: key,
      queryFn: fn,
      staleTime: 60 * 1000,
      ...options,
    });
  }, [queryClient]);

  return { prefetch };
}
