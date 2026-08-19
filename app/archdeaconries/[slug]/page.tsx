import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getArchdeaconry, getArchdeaconries } from '@/lib/api';

export async function generateStaticParams() {
  const archdeaconries = await getArchdeaconries();
  return archdeaconries.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const archdeaconry = await getArchdeaconry(params.slug);
  return { title: archdeaconry?.name ?? 'Archdeaconry' };
}

export default async function ArchdeaconryDetailPage({ params }: { params: { slug: string } }) {
  const archdeaconry = await getArchdeaconry(params.slug);
  if (!archdeaconry) notFound();

  return (
    <>
      <PageHero title={archdeaconry.name} subtitle={archdeaconry.headquarters} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Archdeaconries', href: '/archdeaconries' },
          { label: archdeaconry.name },
        ]}
      />
      <section className="section bg-white">
        <div className="container-diocese max-w-3xl">
          <p className="text-lg text-ink-muted">{archdeaconry.description}</p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold uppercase text-ink-muted">Archdeacon</dt>
              <dd className="text-lg text-navy">{archdeaconry.archdeacon}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase text-ink-muted">Parishes</dt>
              <dd className="text-lg text-navy">{archdeaconry.parishCount}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
