import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = { title: 'Ministries' };

const MINISTRIES = [
  { label: 'WOMEN', name: 'Women Ministry', blurb: 'Empowering women through prayer, fellowship, discipleship and compassionate service.' },
  { label: 'GIRLS', name: "Girls' Guild", blurb: 'Helping young girls grow in faith, character, confidence and service.' },
  { label: 'BOYS', name: 'Boys Brigade', blurb: 'Developing discipline, leadership, Christian character and practical skills.' },
  { label: 'YOUTH', name: 'Youth Ministry', blurb: 'Equipping young people to follow Christ and become positive kingdom leaders.' },
  { label: 'MEN', name: 'Men Ministry', blurb: 'Building godly men through fellowship, prayer, leadership and responsible service.' },
  { label: 'CHILDREN', name: 'Children Ministry', blurb: "Creating a joyful environment where children learn God's Word and grow in faith." },
  { label: 'WORSHIP', name: 'Choir Ministry', blurb: 'Using music and worship to glorify God and lead His people into joyful praise.' },
  { label: 'MISSION', name: 'Evangelism Ministry', blurb: 'Sharing the Gospel, reaching communities and making disciples for Christ.' },
];

export default function MinistriesPage() {
  return (
    <>
      <PageHero title="Ministries" subtitle="The ministries active across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Ministries' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Our Ministry Family</span>
            <h2 className="mt-3">Many Gifts. One Mission.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-muted">
              Our ministries provide opportunities for children, young people, and adults to worship,
              grow, serve, and share the love of Christ.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MINISTRIES.map((m, index) => (
              <Reveal key={m.name} delay={(index % 4) * 80} className="card overflow-hidden p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{m.label}</span>
                <h3 className="text-lg">{m.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{m.blurb}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-blue">Discover Ministry <span aria-hidden="true" className="ml-2 transition-transform group-hover:translate-x-1">→</span></span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-diocese">
          <Reveal className="mx-auto max-w-5xl rounded-card border border-line bg-white p-8 shadow-soft">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Share Your Story</span>
                <h2 className="mt-3">God is still transforming lives.</h2>
                <p className="mt-3 text-lg text-ink-muted">
                  If a ministry has encouraged your faith or helped you experience God&apos;s love,
                  share your testimony with us.
                </p>
                <div className="mt-6 rounded-card border border-line bg-cream p-5">
                  <p className="text-lg text-navy">
                    “Come and hear, all you who fear God, and I will declare what He has done for my soul.”
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-ink-muted">Psalm 66:16</p>
                </div>
              </div>

              <form className="flex flex-col gap-4 rounded-card border border-line bg-cream p-5">
                <h3 className="text-xl">Testimony Form</h3>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="testimony-name" className="text-sm font-semibold text-navy">Your Name</label>
                  <input id="testimony-name" type="text" placeholder="Enter your name" className="min-h-[48px] rounded-lg border border-line bg-white px-4 text-base focus:border-gold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="testimony-email" className="text-sm font-semibold text-navy">Email Address</label>
                  <input id="testimony-email" type="email" placeholder="Enter your email" className="min-h-[48px] rounded-lg border border-line bg-white px-4 text-base focus:border-gold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="testimony-message" className="text-sm font-semibold text-navy">Your Testimony</label>
                  <textarea id="testimony-message" rows={6} placeholder="Tell us what God has done..." className="rounded-lg border border-line bg-white px-4 py-3 text-base focus:border-gold" />
                </div>
                <button type="submit" className="btn-primary w-full">Submit Testimony</button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
