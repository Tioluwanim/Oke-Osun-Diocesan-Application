interface EmptyStateProps {
  title: string;
  message?: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line bg-cream px-6 py-16 text-center">
      <p className="text-lg font-semibold text-navy">{title}</p>
      {message && <p className="max-w-md text-ink-muted">{message}</p>}
    </div>
  );
}
