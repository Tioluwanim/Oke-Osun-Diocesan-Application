import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EventCard({ event }: { event: Event }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative h-48 w-full bg-cream">
        {event.image && (
          <Image src={event.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
          {formatDate(event.date)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg">{event.title}</h3>
        <p className="text-sm text-ink-muted">{event.location}</p>
        <p className="line-clamp-2 text-sm text-ink-muted">{event.description}</p>
        <Link href={`/events/${event.id}`} className="mt-auto pt-3 font-semibold text-blue hover:text-gold">
          View details →
        </Link>
      </div>
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-full" />
      </div>
    </div>
  );
}
