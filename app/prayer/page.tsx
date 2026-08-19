import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = { title: 'Prayer' };

const PRAYER_CATEGORIES = [
  'Personal Prayer',
  'Family',
  'Health',
  'Thanksgiving',
  'Guidance',
  'Church',
  'Other',
] as const;

export default function PrayerPage() {
  return (
    <>
      <PageHero title="Prayer Request" subtitle="Share your prayer request with us; we believe in the power of prayer" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Prayer' }]} />

      <section className="section bg-white">
        <div className="container-diocese max-w-5xl">
          <div className="mb-10 text-center">
            <h2>We Are Here to Pray With You</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-muted">
              Whatever you are going through, you do not have to face it alone. Submit your prayer
              request below and our prayer team will remember it in prayer.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="card p-6 sm:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Prayer Ministry</span>
              <h3 className="mt-4">Let Us Stand With You</h3>
              <p className="mt-3 text-ink-muted">
                Prayer is an important part of the life and ministry of Oke-Osun Diocese. We welcome
                your prayer requests and encourage you to continue trusting God.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  ['Faith', "We trust in God's faithfulness and promises."],
                  ['Prayer', 'We believe prayer brings us closer to God.'],
                  ['Care', 'We seek to support members of our community through prayer and Christian fellowship.'],
                ].map(([title, text]) => (
                  <div key={title} className="flex gap-4 rounded-card border border-line bg-cream p-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-lg text-navy">✦</div>
                    <div>
                      <h4 className="text-lg">{title}</h4>
                      <p className="mt-1 text-sm text-ink-muted">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="card flex flex-col gap-5 p-6 sm:p-8">
              <h2 className="mb-2">Submit Your Prayer Request</h2>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pr-name" className="text-sm font-semibold text-navy">Full Name</label>
                <input id="pr-name" type="text" placeholder="Enter your full name" className="min-h-[48px] rounded-lg border border-line px-4 text-base focus:border-gold" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pr-email" className="text-sm font-semibold text-navy">Email Address</label>
                  <input id="pr-email" type="email" placeholder="Enter your email" className="min-h-[48px] rounded-lg border border-line px-4 text-base focus:border-gold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pr-phone" className="text-sm font-semibold text-navy">Phone Number</label>
                  <input id="pr-phone" type="tel" placeholder="Phone number" className="min-h-[48px] rounded-lg border border-line px-4 text-base focus:border-gold" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pr-category" className="text-sm font-semibold text-navy">Prayer Category</label>
                <select id="pr-category" className="min-h-[48px] rounded-lg border border-line px-4 text-base text-navy focus:border-gold">
                  <option value="">Select a category</option>
                  {PRAYER_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pr-request" className="text-sm font-semibold text-navy">Your Prayer Request</label>
                <textarea id="pr-request" rows={8} maxLength={1000} placeholder="Write your prayer request here..." className="rounded-lg border border-line px-4 py-3 text-base focus:border-gold" />
                <span className="text-right text-xs text-ink-muted">0 / 1000</span>
              </div>

              <button type="submit" className="btn-primary w-full">Submit Prayer Request</button>
            </form>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-diocese">
          <div className="mx-auto max-w-3xl rounded-card border border-line bg-white p-8 text-center shadow-soft">
            <p className="text-4xl text-gold">“</p>
            <p className="text-xl text-navy">
              The prayer of a righteous person is powerful and effective.
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink-muted">James 5:16</p>
          </div>
        </div>
      </section>
    </>
  );
}
