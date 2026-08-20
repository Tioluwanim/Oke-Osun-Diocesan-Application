import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the history, vision, and mission of the Diocese of Oke-Osun.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero title="About the Diocese" subtitle="Our history, vision, and mission" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

      <section className="section bg-white">
        <div className="container-diocese grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-card shadow-diocese">
            <Image src="/images/hero3.png" alt="" fill className="object-cover" />
          </Reveal>
          <Reveal delay={120}>
            <SectionHeader eyebrow="Who We Are" title="A Diocese Built on Christ" align="left" />
            <p className="mb-4 text-lg text-ink-muted">
              The Diocese of Oke-Osun is part of the Church of Nigeria (Anglican Communion),
              serving parishes and communities with the Gospel of Jesus Christ through worship,
              evangelism, discipleship, and community service.
            </p>
            <p className="text-lg text-ink-muted">
              Under the leadership of the Bishop, our archdeaconries, parishes, and ministries work
              together to build up the Body of Christ and serve the wider community.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-diocese grid gap-6 sm:grid-cols-2">
          <Reveal className="card p-8">
            <h2>Our Vision</h2>
            <p className="mt-3 text-ink-muted">
              A Diocese of vibrant, Christ-centered parishes making disciples and transforming
              communities across Oke-Osun and beyond.
            </p>
          </Reveal>
          <Reveal delay={100} className="card p-8">
            <h2>Our Mission</h2>
            <p className="mt-3 text-ink-muted">
              To proclaim the Gospel, nurture disciples, raise godly leadership, and serve our
              communities in the love of Christ.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-diocese grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <SectionHeader eyebrow="Our Identity" title="A people shaped by faith" align="left" />
          </Reveal>
          <Reveal delay={100} className="grid gap-4 sm:grid-cols-2">
            {[
              ['Biblical Authority', "We uphold the Holy Scriptures as God's inspired Word."],
              ['Prayer', 'Prayer is central to our worship, ministry, and daily life.'],
              ['Discipleship', 'We nurture believers to grow in faith and Christlike character.'],
              ['Service', "We demonstrate God's love through compassionate service."],
            ].map(([title, text]) => <div key={title} className="rounded-card border border-line bg-cream p-5"><h3 className="text-lg">{title}</h3><p className="mt-2 text-base text-ink-muted">{text}</p></div>)}
          </Reveal>
        </div>
      </section>

      <section className="section bg-navy text-white">
        <div className="container-diocese grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal><p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">Our Slogan</p><h2 className="mt-3 text-white">Serving Christ. Serving Humanity. Transforming Communities.</h2></Reveal>
          <Reveal delay={120}><p className="text-lg leading-relaxed text-white/75">Our history is a continuing story of worship, mission, education, pastoral care, and faithful service across Oke-Osun. We look toward the future with confidence in God&apos;s grace and a renewed commitment to the communities entrusted to us.</p></Reveal>
        </div>
      </section>
    </>
  );
}
