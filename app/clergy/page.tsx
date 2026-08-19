import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ClergyCard from '@/components/cards/ClergyCard';
import EmptyState from '@/components/ui/EmptyState';
import { getClergy } from '@/lib/api';

export const metadata: Metadata = { title: 'Clergy Directory' };

export default async function ClergyPage() {
  const clergy = await getClergy();

  return (
    <>
      <PageHero title="Clergy Directory" subtitle="Meet the clergy serving across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Clergy' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          {clergy.length === 0 ? (
            <EmptyState title="No clergy records available yet." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clergy.map((member) => (
                <ClergyCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
