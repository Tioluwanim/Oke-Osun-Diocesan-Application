import Link from 'next/link';
import { Program } from '@/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProgramCard({ program }: { program: Program }) {
  const placesLeft = program.availablePlaces;
  return (
    <article className="card flex h-full flex-col gap-3 p-5">
      <span className="w-fit rounded-full bg-cream px-3 py-1 text-base font-semibold uppercase tracking-wide text-blue">
        {program.type}
      </span>
      <h3 className="text-lg">{program.title}</h3>
      <p className="text-base text-ink-muted">
        {formatDate(program.date)} · {program.location}
      </p>
      <p className="line-clamp-2 text-base text-ink-muted">{program.description}</p>
      <p className="text-base font-medium text-navy">
        {placesLeft > 0 ? `${placesLeft} places remaining` : 'Registration full'}
      </p>
      <Link href={`/programs/${program.id}`} className="btn-secondary mt-auto w-fit">
        View & Register
      </Link>
    </article>
  );
}

export function ProgramCardSkeleton() {
  return (
    <div className="card space-y-3 p-5" aria-hidden="true">
      <div className="skeleton h-5 w-20" />
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-10 w-32" />
    </div>
  );
}
