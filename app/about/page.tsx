import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about the history, vision, and mission of the Diocese of Oke-Osun.',
};

const MISSION_POINTS = [
  'To be actively engaged in holistic mission through pragmatic evangelism and discipleship.',
  'To be vanguard of qualitative education, commerce, good medical care and coordinated social welfare schemes.',
  'To revive Anglican spirituality by emphasizing practical Christianity.',
  'To empower our youth through vocational training, entrepreneurship and agriculture.',
  'To give more opportunities to our clergy for further studies and refresher courses.',
  'To be a giving and caring Church like the Macedonians (2 Cor. 8:1–5).',
];

const CORE_VALUES = [
  {
    icon: '📖',
    title: 'Biblical Authority',
    text: "We uphold the Holy Scriptures as God's inspired Word.",
  },
  {
    icon: '🙏',
    title: 'Prayer',
    text: 'Prayer is central to our worship, ministry, and daily life.',
  },
  {
    icon: '🤝',
    title: 'Discipleship',
    text: 'We nurture believers to grow in faith and Christlike character.',
  },
  {
    icon: '❤',
    title: 'Service',
    text: "We demonstrate God's love through compassionate service.",
  },
];

const SLOGANS = [
  'We are the Light of the World',
  'Arise and Shine',
  'Shine the Light',
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About the Diocese"
        subtitle="Serving Christ • Serving Humanity • Transforming Communities"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'About' },
        ]}
      />

      {/* WHO WE ARE */}
      <section className="section bg-white">
        <div className="container-diocese grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal
            variant="left"
            className="relative aspect-[4/3] overflow-hidden rounded-card shadow-diocese"
          >
            <Image
              src="/images/hero3.png"
              alt=""
              fill
              className="object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-6">
              <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">
                Est. 1993
              </p>

              <h3 className="mt-1 text-white">
                Anglican Province of Ibadan
              </h3>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <SectionHeader
              eyebrow="Who We Are"
              title="Oke-Osun Diocese"
              align="left"
            />

            <p className="mb-4 text-lg text-ink-muted">
              The Oke-Osun Diocese is part of the Church of Nigeria
              (Anglican Communion), committed to proclaiming the Gospel of
              Jesus Christ, strengthening Christian families, raising
              faithful disciples, and serving communities through
              education, healthcare, evangelism, and social development.
            </p>

            <p className="text-lg text-ink-muted">
              Our Diocese seeks to glorify God by nurturing believers,
              training clergy and lay leaders, planting churches, and
              demonstrating Christ&apos;s love through compassionate
              service.
            </p>
          </Reveal>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="section bg-cream">
        <div className="container-diocese">
          <Reveal className="mb-10 text-center">
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">
              Our Calling
            </p>

            <h2 className="mt-3">
              Vision &amp; Mission
            </h2>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <Reveal
              variant="left"
              className="stat-card card flex flex-col border-t-4 border-gold p-8"
            >
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy text-3xl text-gold"
                aria-hidden="true"
              >
                🕊
              </div>

              <h2 className="text-center">
                Our Vision
              </h2>

              <p className="mt-4 text-ink-muted">
                Our vision is to build a virile Diocese that shall be
                growing light in the darkness of the world, shining
                brighter every day through the proclamation of the Gospel
                of our Lord Jesus Christ to both old and young people in
                society; winning souls for Christ, baptizing, teaching and
                making them disciples to disciple others fit for the
                Kingdom of God.
              </p>
            </Reveal>

            <Reveal
              variant="right"
              delay={120}
              className="stat-card card flex flex-col border-t-4 border-gold p-8"
            >
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy text-3xl text-gold"
                aria-hidden="true"
              >
                ✓
              </div>

              <h2 className="text-center">
                Our Mission
              </h2>

              <p className="mt-4 text-ink-muted">
                Oke-Osun shall be a Bible-based Diocese that is on the
                path of rebirth at the ancient way of worshipping God in
                Spirit and truth.
              </p>

              <ul className="mt-4 space-y-2 text-base text-ink-muted">
                {MISSION_POINTS.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 text-gold">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="section bg-white">
        <div className="container-diocese">
          <Reveal className="mb-10 text-center">
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">
              Our Identity
            </p>

            <h2 className="mt-3">
              A People Shaped by Faith
            </h2>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_VALUES.map((value, index) => (
              <Reveal
                key={value.title}
                variant="scale"
                delay={index * 100}
              >
                <div className="stat-card card h-full p-6 text-center">
                  <div
                    className="float-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-navy"
                    aria-hidden="true"
                  >
                    {value.icon}
                  </div>

                  <h3 className="text-lg">
                    {value.title}
                  </h3>

                  <p className="mt-2 text-base text-ink-muted">
                    {value.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SLOGAN */}
      <section className="relative overflow-hidden section bg-navy text-white">
        {/* Large background cross */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 select-none font-serif text-[18rem] leading-none text-gold/[0.04]"
        >
          ✝
        </span>

        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.04] blur-3xl"
        />

        <div className="container-diocese relative">
          <Reveal className="text-center">
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">
              Our Slogan
            </p>

            <h2 className="mt-3 text-white">
              A People of Light
            </h2>

            {/* Three slogans */}
            <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
              {SLOGANS.map((slogan, index) => (
                <Reveal
                  key={slogan}
                  variant="scale"
                  delay={index * 100}
                >
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-gold/40 hover:bg-white/[0.08]">
                    <div
                      aria-hidden="true"
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-2xl text-gold transition-transform duration-500 group-hover:scale-110"
                    >
                      ✦
                    </div>

                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
                      Oke–Osun Diocese
                    </p>

                    <p className="mt-2 text-lg font-semibold leading-7 text-white">
                      {slogan}
                    </p>

                    <div className="mx-auto mt-5 h-1 w-8 rounded-full bg-gold/50 transition-all duration-500 group-hover:w-14 group-hover:bg-gold" />
                  </div>
                </Reveal>
              ))}
            </div>

            {/* HOLY GHOST FIRE */}
            <Reveal delay={350} variant="scale">
              <div className="relative mx-auto mt-10 max-w-4xl">
                {/* Decorative lines */}
                <div className="flex items-center justify-center gap-4">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />

                  <span className="text-sm text-gold">
                    ✦
                  </span>

                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
                </div>

                <div className="relative mt-8 overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-gold/15 via-white/[0.05] to-transparent px-6 py-10 shadow-[0_0_60px_rgba(255,215,0,0.08)] sm:px-10 sm:py-12">
                  {/* Fire glow */}
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl"
                  />

                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold/70">
                      Our Fire
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-4">
                      <span
                        aria-hidden="true"
                        className="text-4xl drop-shadow-[0_0_12px_rgba(255,215,0,0.35)] sm:text-5xl"
                      >
                        🔥
                      </span>

                      <h3 className="text-3xl font-bold tracking-tight text-gold sm:text-5xl">
                        Holy Ghost Fire
                      </h3>

                      <span
                        aria-hidden="true"
                        className="text-4xl drop-shadow-[0_0_12px_rgba(255,215,0,0.35)] sm:text-5xl"
                      >
                        🔥
                      </span>
                    </div>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                      A people alive in Christ, walking in the light,
                      rising in faith, and burning with the fire of the
                      Holy Spirit.
                    </p>

                    <div className="mx-auto mt-7 flex items-center justify-center gap-3">
                      <span className="h-1 w-12 rounded-full bg-gold/40" />
                      <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_rgba(255,215,0,0.7)]" />
                      <span className="h-1 w-24 rounded-full bg-gold shadow-[0_0_10px_rgba(255,215,0,0.35)]" />
                      <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_rgba(255,215,0,0.7)]" />
                      <span className="h-1 w-12 rounded-full bg-gold/40" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Final declaration */}
            <Reveal delay={500}>
              <p className="mx-auto mt-8 max-w-2xl text-sm font-medium uppercase tracking-[0.18em] text-white/45 sm:text-base">
                We are the Light • We Arise • We Shine • We Burn for Christ
              </p>
            </Reveal>
          </Reveal>
        </div>
      </section>

      {/* HISTORY */}
      <section className="section bg-cream">
        <div className="container-diocese grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal variant="left">
            <SectionHeader
              eyebrow="Our Story"
              title="Our History"
              align="left"
            />

            <p className="text-lg text-ink-muted">
              The history of Oke-Osun Diocese is a testimony to God&apos;s
              faithfulness. From its establishment, the Diocese has
              continued to grow through dedicated clergy, faithful
              members, and committed evangelistic efforts. Over the years,
              new parishes, educational institutions, and ministries have
              been established to strengthen the Anglican witness
              throughout the region.
            </p>

            <p className="mt-4 text-lg text-ink-muted">
              Today, the Diocese continues to invest in evangelism, youth
              development, leadership training, mission work, and
              community transformation, remaining committed to the Great
              Commission and the historic Anglican faith.
            </p>

            <Link
              href="/resources"
              className="btn-primary mt-8 inline-flex"
            >
              Download History &amp; Constitution
            </Link>
          </Reveal>

          <Reveal
            variant="right"
            delay={120}
            className="relative aspect-[4/3] overflow-hidden rounded-card shadow-diocese"
          >
            <Image
              src="/images/hero4.png"
              alt=""
              fill
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
