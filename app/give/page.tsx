import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import DonateWidget from '@/components/forms/DonateWidget';

export const metadata: Metadata = { title: 'Give' };

export default function GivePage() {
  return (
    <>
      <PageHero title="Give Online" subtitle="Partner with the Diocese through your tithes and offerings" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Give' }]} />
      <section className="section bg-cream">
        <div className="container-diocese max-w-xl">
          <DonateWidget />
        </div>
      </section>
    </>
  );
}
