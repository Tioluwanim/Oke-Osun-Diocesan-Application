import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProgramCard from '@/components/cards/ProgramCard';
import EmptyState from '@/components/ui/EmptyState';
import { getPrograms } from '@/lib/api';

export const metadata: Metadata = { title: 'Programs' };

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return (
    <>
      <PageHero title="Programs" subtitle="Retreats, camps, conferences, and seminars" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Programs' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          {programs.length === 0 ? (
            <EmptyState title="No programs are currently open for registration." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
