import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = { title: 'Institutions' };

const INSTITUTIONS = [
  { name: 'Diocesan Nursery & Primary School', type: 'Education' },
  { name: 'Diocesan Grammar School', type: 'Education' },
  { name: 'Diocesan Health Centre', type: 'Healthcare' },
];

export default function InstitutionsPage() {
  return (
    <>
      <PageHero title="Institutions" subtitle="Schools, hospitals, and other diocesan institutions" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Institutions' }]} />
      <section className="section bg-white">
        <div className="container-diocese grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INSTITUTIONS.map((i) => (
            <div key={i.name} className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">{i.type}</p>
              <h3 className="mt-2 text-lg">{i.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
