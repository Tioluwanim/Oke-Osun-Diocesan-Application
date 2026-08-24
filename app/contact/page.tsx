import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" subtitle="We would love to hear from you" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
      <section className="section bg-white">
        <div className="container-diocese grid gap-10 lg:grid-cols-2">
          <form className="card flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-name" className="text-base font-semibold text-navy">Full Name</label>
              <input id="c-name" type="text" className="min-h-[48px] rounded-lg border border-line px-4 text-base focus:border-gold" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-email" className="text-base font-semibold text-navy">Email Address</label>
              <input id="c-email" type="email" className="min-h-[48px] rounded-lg border border-line px-4 text-base focus:border-gold" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-message" className="text-base font-semibold text-navy">Message</label>
              <textarea id="c-message" rows={5} className="rounded-lg border border-line px-4 py-3 text-base focus:border-gold" />
            </div>
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>

          <div>
            <h2>Bishop&apos;s Court</h2>
            <address className="mt-4 space-y-2 not-italic text-lg text-ink-muted">
              <p>Bishopscourt, Alape Area, PO Box 251, Gbongan, Osun State, Nigeria</p>
              <p><a href="tel:+2348037717194" className="hover:text-gold">+234 803 771 7194</a></p>
              <p><a href="mailto:info@okeosundiocese.org" className="hover:text-gold">info@okeosundiocese.org</a></p>
            </address>
            <div className="mt-6 aspect-video overflow-hidden rounded-card border border-line">
              <iframe
                title="Map to Bishop's Court, Gbongan"
                className="h-full w-full"
                loading="lazy"
                src="https://www.google.com/maps?q=Bishopscourt,+Gbongan,+Osun+State,+Nigeria&output=embed"
              />
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              Map centred on Gbongan, Osun State — the diocesan headquarters town. If you need
              precise turn-by-turn directions, please call ahead using the number above.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
