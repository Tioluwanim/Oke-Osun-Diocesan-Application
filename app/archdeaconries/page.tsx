import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import { getArchdeaconries } from '@/lib/api';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = { title: 'Archdeaconries' };

export default async function ArchdeaconriesPage() {
  const archdeaconries = await getArchdeaconries();

  return (
    <>
      <PageHero title="Archdeaconries" subtitle="The archdeaconries that make up our Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Archdeaconries' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          {archdeaconries.length === 0 ? (
            <EmptyState title="No archdeaconries listed yet." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {archdeaconries.map((a, index) => (
                <Reveal key={a.id} delay={(index % 6) * 70}>
                <Link href={`/archdeaconries/${a.slug}`} className="card flex h-full flex-col gap-2 p-6">
                  <h3 className="text-lg">{a.name}</h3>
                  <p className="text-base text-ink-muted">Archdeacon: {a.archdeacon}</p>
                  <p className="text-base text-ink-muted">{a.parishCount} parishes · {a.headquarters}</p>
                  <p className="mt-2 text-base text-ink-muted">{a.description}</p>
                  <span className="mt-2 font-semibold text-blue">View details →</span>
                </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
