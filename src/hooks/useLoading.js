import { useState, useCallback } from 'react';

export default function useLoading(initial = false) {
  const [loading, setLoading] = useState(initial);

  const withLoading = useCallback(async (fn) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
}
