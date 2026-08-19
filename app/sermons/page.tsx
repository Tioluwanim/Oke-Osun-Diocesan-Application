import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SermonCard from '@/components/cards/SermonCard';
import EmptyState from '@/components/ui/EmptyState';
import { getSermons } from '@/lib/api';

export const metadata: Metadata = { title: 'Sermons' };

export default async function SermonsPage() {
  const sermons = await getSermons();
  return (
    <>
      <PageHero title="Sermons" subtitle="Listen and watch messages from across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Sermons' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          {sermons.length === 0 ? (
            <EmptyState title="No sermons have been published yet." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.map((s) => (
                <SermonCard key={s.id} sermon={s} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
