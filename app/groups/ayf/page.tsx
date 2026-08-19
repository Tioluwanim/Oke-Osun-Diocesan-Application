import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getGroups } from '@/lib/api';

export const metadata: Metadata = { title: 'Anglican Youth Fellowship (AYF)' };

export default async function AyfPage() {
  const groups = await getGroups();
  const group = groups.find((g) => g.slug === 'ayf');

  return (
    <>
      <PageHero title="Anglican Youth Fellowship (AYF)" subtitle={group?.description} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Groups', href: '/groups' }, { label: 'AYF' }]} />
      <section className="section bg-white">
        <div className="container-diocese max-w-2xl">
          <p className="text-lg text-ink-muted">{group?.description}</p>
        </div>
      </section>
    </>
  );
}
