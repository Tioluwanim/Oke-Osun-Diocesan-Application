'use client';

import ErrorState from '@/components/ui/ErrorState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-diocese py-20">
      <ErrorState
        title="We could not load this page."
        message="Please check your internet connection and try again. If the problem continues, contact the Diocesan Secretariat."
        onRetry={reset}
      />
    </div>
  );
}
