import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getGroups } from '@/lib/api';

export const metadata: Metadata = { title: 'Groups' };

export default async function GroupsPage() {
  const groups = await getGroups();
  const topLevel = groups.filter((g) => !g.parentSlug);

  return (
    <>
      <PageHero title="Groups" subtitle="Fellowships and organizations across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Groups' }]} />
      <section className="section bg-white">
        <div className="container-diocese grid gap-6 sm:grid-cols-2">
          {topLevel.map((g) => (
            <Link key={g.slug} href={`/groups/${g.slug}`} className="card flex flex-col gap-2 p-6">
              <h3 className="text-lg">{g.name}</h3>
              <p className="text-sm text-ink-muted">{g.description}</p>
              <span className="mt-2 font-semibold text-blue">Explore →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
