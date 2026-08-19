import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import DonateWidget from '@/components/forms/DonateWidget';

export const metadata: Metadata = { title: 'Support the Diocese' };

export default function SupportPage() {
  return (
    <>
      <PageHero title="Support the Diocese" subtitle="Partner with us in advancing the Gospel of Jesus Christ" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Support' }]} />
      <section className="section bg-white">
        <div className="container-diocese grid gap-10 lg:grid-cols-[1fr_480px] lg:items-start">
          <div>
            <h2>Partner in God&apos;s Mission</h2>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">
              Oke-Osun Diocese is committed to proclaiming the Gospel, strengthening our churches,
              supporting clergy, raising future leaders, caring for the vulnerable, and transforming communities through the love of Christ.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['Tithes', "Faithfully support God's work through your tithe."],
                ['Thanksgiving Offerings', "Express gratitude for God's goodness and faithfulness."],
                ['Mission Support', 'Help spread the Gospel through evangelism and church planting.'],
                ['Education Fund', 'Support diocesan schools, scholarships and Christian education.'],
                ['Building Projects', 'Support Diocese development and upcoming church buildings.'],
                ['Welfare Ministry', 'Provide assistance to widows, orphans and families in need.'],
              ].map(([title, description]) => (
                <div key={title} className="card p-5">
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 card p-6">
              <h3>Bank Details</h3>
              <dl className="mt-4 space-y-3 text-ink-muted">
                <div className="flex justify-between gap-4 border-b border-line pb-2"><dt>Bank Name</dt><dd className="font-medium text-navy">First Bank PLC</dd></div>
                <div className="flex justify-between gap-4 border-b border-line pb-2"><dt>Account Name</dt><dd className="font-medium text-navy">Oke-Osun Diocese</dd></div>
                <div className="flex justify-between gap-4"><dt>Account Number</dt><dd className="font-medium text-navy">1234567890</dd></div>
              </dl>
            </div>
          </div>
          <DonateWidget />
        </div>
      </section>
    </>
  );
}
