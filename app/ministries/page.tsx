import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = { title: 'Ministries' };

const MINISTRIES = [
  { name: 'Evangelism & Missions', blurb: 'Taking the Gospel to communities within and beyond the Diocese.' },
  { name: 'Discipleship & Christian Education', blurb: 'Bible study, catechism, and spiritual formation for all ages.' },
  { name: 'Music & Liturgy', blurb: 'Choirs and worship teams leading the Diocese in praise.' },
  { name: 'Welfare & Community Service', blurb: 'Caring for the vulnerable and serving the wider community.' },
  { name: 'Prison & Hospital Ministry', blurb: 'Visitation and pastoral care for the incarcerated and the sick.' },
  { name: 'Men\'s Fellowship', blurb: 'Fellowship, discipleship, and service for men across the Diocese.' },
];

export default function MinistriesPage() {
  return (
    <>
      <PageHero title="Ministries" subtitle="The ministries active across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Ministries' }]} />
      <section className="section bg-white">
        <div className="container-diocese grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MINISTRIES.map((m) => (
            <div key={m.name} className="card p-6">
              <h3 className="text-lg">{m.name}</h3>
              <p className="mt-2 text-sm text-ink-muted">{m.blurb}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
