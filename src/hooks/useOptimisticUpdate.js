import { useCallback } from 'react';

export default function useOptimisticUpdate() {
  const runOptimistic = useCallback(async ({
    apply,
    rollback,
    request,
  }) => {
    const snapshot = apply();
    try {
      const data = await request();
      return { success: true, data };
    } catch (error) {
      if (rollback) rollback(snapshot);
      return { success: false, error };
    }
  }, []);

  return { runOptimistic };
}
