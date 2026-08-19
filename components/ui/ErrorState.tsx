'use client';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong.',
  message = 'We could not load this content. Please check your internet connection and try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-line bg-white px-6 py-16 text-center shadow-soft">
      <p className="text-lg font-semibold text-navy">{title}</p>
      <p className="max-w-md text-ink-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      )}
    </div>
  );
}
