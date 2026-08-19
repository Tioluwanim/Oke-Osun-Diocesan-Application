import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import DonateWidget from '@/components/forms/DonateWidget';

export const metadata: Metadata = { title: 'Give' };

export default function GivePage() {
  return (
    <>
      <PageHero title="Support the Diocese" subtitle="Partner with us in advancing the Gospel of Jesus Christ" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Give' }]} />
      <section className="section bg-white">
        <div className="container-diocese grid gap-10 lg:grid-cols-[1fr_480px] lg:items-start">
          <div>
            <h2>Partner in God&apos;s Mission</h2>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">
              Your support helps the Diocese proclaim the Gospel, strengthen churches, support clergy,
              raise Christian leaders, care for the vulnerable, and transform communities through Christ&apos;s love.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['Tithes', "Faithfully support God's work through your tithe."],
                ['Thanksgiving Offerings', "Express gratitude for God's goodness and faithfulness."],
                ['Mission Support', 'Help spread the Gospel through evangelism and church planting.'],
                ['Education Fund', 'Support diocesan schools, scholarships, and Christian education.'],
                ['Building Projects', 'Support diocesan development and church buildings.'],
                ['Welfare Ministry', 'Provide assistance to widows, orphans, and families in need.'],
              ].map(([title, description]) => (
                <div key={title} className="card p-5">
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
          <DonateWidget />
        </div>
      </section>
    </>
  );
}
