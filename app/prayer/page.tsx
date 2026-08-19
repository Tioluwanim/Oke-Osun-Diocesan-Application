import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = { title: 'Prayer' };

export default function PrayerPage() {
  return (
    <>
      <PageHero title="Prayer" subtitle="Join our diocesan prayer network" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Prayer' }]} />
      <section className="section bg-white">
        <div className="container-diocese max-w-2xl">
          <h2>Submit a Prayer Request</h2>
          <p className="mt-3 text-lg text-ink-muted">
            The Diocesan prayer team intercedes for requests submitted by members and friends of
            the Diocese. Requests are handled with confidentiality and care.
          </p>
          <form className="card mt-8 flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pr-name" className="text-sm font-semibold text-navy">Full Name</label>
              <input id="pr-name" type="text" className="min-h-[48px] rounded-lg border border-line px-4 text-base focus:border-gold" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pr-request" className="text-sm font-semibold text-navy">Prayer Request</label>
              <textarea id="pr-request" rows={5} className="rounded-lg border border-line px-4 py-3 text-base focus:border-gold" />
            </div>
            <button type="submit" className="btn-primary w-full">Submit Request</button>
          </form>
        </div>
      </section>
    </>
  );
}
