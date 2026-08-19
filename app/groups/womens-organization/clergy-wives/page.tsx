import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getGroups } from '@/lib/api';

export const metadata: Metadata = { title: "Clergy Wives" };

export default async function Page() {
  const groups = await getGroups();
  const group = groups.find((g) => g.slug === 'clergy-wives');

  return (
    <>
      <PageHero title="Clergy Wives" subtitle={group?.description} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Groups', href: '/groups' },
          { label: "Women's Organization", href: '/groups/womens-organization' },
          { label: "Clergy Wives" },
        ]}
      />
      <section className="section bg-white">
        <div className="container-diocese max-w-2xl">
          <p className="text-lg text-ink-muted">{group?.description}</p>
        </div>
      </section>
    </>
  );
}
