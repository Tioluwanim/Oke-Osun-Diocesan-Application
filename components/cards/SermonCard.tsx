import Link from 'next/link';
import { Sermon } from '@/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SermonCard({ sermon }: { sermon: Sermon }) {
  return (
    <article className="card flex flex-col gap-3 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold">{sermon.scripture}</p>
      <h3 className="text-lg">{sermon.title}</h3>
      <p className="text-sm text-ink-muted">
        {sermon.preacher} · {formatDate(sermon.date)}
      </p>
      <p className="line-clamp-2 text-sm text-ink-muted">{sermon.description}</p>
      <Link href={`/sermons/${sermon.id}`} className="mt-1 font-semibold text-blue hover:text-gold">
        Listen / Watch →
      </Link>
    </article>
  );
}

export function SermonCardSkeleton() {
  return (
    <div className="card space-y-3 p-5" aria-hidden="true">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-4 w-full" />
    </div>
  );
}
