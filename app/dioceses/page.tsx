import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import DioceseDirectoryList from '@/components/forms/DioceseDirectoryList';
import { getDioceseLinks } from '@/lib/api';

export const metadata: Metadata = { title: 'Diocese Directory' };

export default async function DiocesesPage() {
  const dioceses = await getDioceseLinks();
  return (
    <>
      <PageHero title="Diocese Directory" subtitle="Other dioceses within the Church of Nigeria" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dioceses' }]} />
      <section className="section bg-white">
        <div className="container-diocese max-w-3xl">
          <DioceseDirectoryList dioceses={dioceses} />
        </div>
      </section>
    </>
  );
}
