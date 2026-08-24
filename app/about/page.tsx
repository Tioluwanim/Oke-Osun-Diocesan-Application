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
      <PageHero title="About the Diocese" subtitle="Serving Christ • Serving Humanity • Transforming Communities" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

      <section className="section bg-white">
        <div className="container-diocese grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-card shadow-diocese">
            <Image src="/images/hero3.png" alt="" fill className="object-cover" />
          </Reveal>
          <Reveal delay={120}>
            <SectionHeader eyebrow="Who We Are" title="Oke-Osun Diocese" align="left" />
            <p className="mb-4 text-lg text-ink-muted">
              The Oke-Osun Diocese is part of the Church of Nigeria (Anglican Communion),
              committed to proclaiming the Gospel of Jesus Christ, strengthening Christian
              families, raising faithful disciples, and serving communities through education,
              healthcare, evangelism, and social development.
            </p>
            <p className="text-lg text-ink-muted">
              Our Diocese seeks to glorify God by nurturing believers, training clergy and lay
              leaders, planting churches, and demonstrating Christ&apos;s love through
              compassionate service.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-diocese grid gap-6 lg:grid-cols-2">
          <Reveal className="card p-8">
            <h2>Our Vision</h2>
            <p className="mt-3 text-ink-muted">
              Our vision is to build a virile Diocese that shall be growing light in the darkness
              of the world, shining brighter every day through the proclamation of the Gospel of
              our Lord Jesus Christ to both old and young people in society; winning souls for
              Christ, baptizing, teaching and making them disciples to disciple others fit for the
              Kingdom of God.
            </p>
          </Reveal>
          <Reveal delay={100} className="card p-8">
            <h2>Our Mission</h2>
            <p className="mt-3 text-ink-muted">
              Oke-Osun shall be a Bible-based Diocese that is on the path of rebirth at the ancient
              way of worshipping God in Spirit and truth.
            </p>
            <ul className="mt-4 space-y-2 text-base text-ink-muted">
              {[
                'To be actively engaged in holistic mission through pragmatic evangelism and discipleship.',
                'To be vanguard of qualitative education, commerce, good medical care and coordinated social welfare schemes.',
                'To revive Anglican spirituality by emphasizing practical Christianity.',
                'To empower our youth through vocational training, entrepreneurship and agriculture.',
                'To give more opportunities to our clergy for further studies and refresher courses.',
                'To be a giving and caring Church like the Macedonians (2 Cor. 8:1–5).',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-gold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
        <div className="container-diocese text-center">
          <Reveal>
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">Our Slogan</p>
            <div className="mx-auto mt-4 grid max-w-2xl gap-3">
              {[
                'Oke–Osun Diocese — We are the Light of the World',
                'Oke–Osun Diocese — Arise and Shine',
                'Oke–Osun Diocese — Shine the Light',
              ].map((slogan) => (
                <p key={slogan} className="text-lg font-semibold text-white">✦ {slogan}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-diocese max-w-3xl">
          <Reveal>
            <SectionHeader eyebrow="Our Story" title="Our History" align="left" />
            <p className="mt-4 text-lg text-ink-muted">
              The history of Oke-Osun Diocese is a testimony to God&apos;s faithfulness. From its
              establishment, the Diocese has continued to grow through dedicated clergy, faithful
              members, and committed evangelistic efforts. Over the years, new parishes,
              educational institutions, and ministries have been established to strengthen the
              Anglican witness throughout the region.
            </p>
            <p className="mt-4 text-lg text-ink-muted">
              Today, the Diocese continues to invest in evangelism, youth development, leadership
              training, mission work, and community transformation, remaining committed to the
              Great Commission and the historic Anglican faith.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
