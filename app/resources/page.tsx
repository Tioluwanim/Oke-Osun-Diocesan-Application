import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = { title: 'Resources' };

const RESOURCES = [
  { name: 'Book of Common Prayer', type: 'PDF' },
  { name: 'Diocesan Constitution', type: 'PDF' },
  { name: 'Sunday School Manual', type: 'PDF' },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHero title="Resources" subtitle="Downloadable resources from the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Resources' }]} />
      <section className="section bg-white">
        <div className="container-diocese max-w-3xl">
          <ul className="divide-y divide-line rounded-card border border-line bg-white shadow-soft">
            {RESOURCES.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-navy">{r.name}</p>
                  <p className="text-base text-ink-muted">{r.type}</p>
                </div>
                <button type="button" className="btn-secondary">Download</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
