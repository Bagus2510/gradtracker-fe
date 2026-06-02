"use client";

import { useEffect, useState } from "react";

/**
 * Generic async data-fetching hook.
 * Usage: const { data, isLoading, error, refetch } = useAsync(() => fetchKPI())
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const run = () => {
    setIsLoading(true);
    setError(null);
    fn()
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e : new Error(String(e))),
      )
      .finally(() => setIsLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(run, deps);

  return { data, isLoading, error, refetch: run };
}
