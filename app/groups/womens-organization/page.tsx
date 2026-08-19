import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getGroups } from '@/lib/api';

export const metadata: Metadata = { title: "Women's Organization" };

export default async function WomensOrganizationPage() {
  const groups = await getGroups();
  const children = groups.filter((g) => g.parentSlug === 'womens-organization');

  return (
    <>
      <PageHero title="Women's Organization" subtitle="Ministries serving women across the Diocese" />
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Groups', href: '/groups' }, { label: "Women's Organization" }]}
      />
      <section className="section bg-white">
        <div className="container-diocese grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((g) => (
            <Link key={g.slug} href={`/groups/womens-organization/${g.slug}`} className="card flex flex-col gap-2 p-6">
              <h3 className="text-lg">{g.name}</h3>
              <p className="text-sm text-ink-muted">{g.description}</p>
              <span className="mt-2 font-semibold text-blue">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
