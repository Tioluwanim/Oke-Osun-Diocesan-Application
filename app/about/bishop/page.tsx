import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'The Bishop',
  description: 'Meet the Bishop of the Diocese of Oke-Osun.',
};

export default function BishopPage() {
  return (
    <>
      <PageHero title="The Bishop" image="/images/bishop.png" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }, { label: 'Bishop' }]} />

      <section className="section bg-white">
        <div className="container-diocese grid gap-10 lg:grid-cols-[320px_1fr] lg:items-start">
          <Reveal className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-card shadow-diocese">
            <Image src="/images/bishop.png" alt="The Bishop of Oke-Osun Diocese" fill className="object-cover" />
          </Reveal>
          <Reveal delay={120}>
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">Office of the Bishop</p>
            <h2 className="mt-3">The Rt. Rev. Oluwagbemiro Ayodele Fabuluje</h2>
            <p className="mt-2 font-semibold text-blue">Diocesan Bishop of Oke-Osun Diocese</p>
            <p className="mt-4 text-lg text-ink-muted">
              Welcome to the official page of the Diocesan Bishop of the Diocese of Oke-Osun,
              Church of Nigeria (Anglican Communion). The Bishop provides spiritual leadership for
              the Diocese, overseeing the clergy, parishes, evangelistic work, education, and
              mission activities while encouraging every believer to grow in faith and obedience
              to Christ.
            </p>
            <p className="mt-4 text-lg text-ink-muted">
              &ldquo;Our calling is to preach Christ faithfully, build God&apos;s people, and
              transform our communities through the Gospel.&rdquo;
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-cream"><div className="container-diocese grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[
        ['Church Growth', 'Expansion of parishes and mission stations.'],
        ['Evangelism', 'Commitment to spreading the Gospel throughout the Diocese.'],
        ['Education', 'Support for Anglican schools and theological training.'],
        ['Community Outreach', 'Healthcare, youth empowerment and humanitarian service.'],
      ].map(([title, text], index) => <Reveal key={title} delay={index * 80} className="card p-6"><h3 className="text-lg">{title}</h3><p className="mt-2 text-base text-ink-muted">{text}</p></Reveal>)}</div></section>

      <section className="section bg-white">
        <div className="container-diocese max-w-3xl">
          <Reveal>
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">His Story</p>
            <h2 className="mt-3">Biography</h2>
          </Reveal>
          <div className="mt-8 grid gap-8">
            <Reveal delay={80} className="border-l-4 border-gold pl-6">
              <h3 className="text-lg">Early Life &amp; Education</h3>
              <p className="mt-2 text-base text-ink-muted">
                The Rt. Rev. Oluwagbemiro Fabuluje is the son of the late Rt. Rev. Jeremiah
                Olagbamigbe Fabuluje, who served as Bishop of Kwara until his retirement in 2005
                and passed away in 2008. He graduated from Obafemi Awolowo University in 1995 and
                went on to study at Immanuel College, Ibadan, completing his studies there in 1997.
              </p>
            </Reveal>
            <Reveal delay={160} className="border-l-4 border-gold pl-6">
              <h3 className="text-lg">Ordination &amp; Early Ministry</h3>
              <p className="mt-2 text-base text-ink-muted">
                He was made a deacon in December 1999 at the Cathedral of All Saints, Balogun
                Agoro, Osogbo. His ministry developed within the Anglican Diocese of Osun, where he
                went on to serve as Archdeacon and later as Provost before his election to the
                episcopate.
              </p>
            </Reveal>
            <Reveal delay={240} className="border-l-4 border-gold pl-6">
              <h3 className="text-lg">Episcopal Ministry</h3>
              <p className="mt-2 text-base text-ink-muted">
                He was elected Bishop of Oke-Osun by the Church of Nigeria&apos;s House of Bishops
                in January 2021, succeeding the late Bishop Foluso Taiwo, who had died in November
                2020. The Diocese of Oke-Osun, established in 1993, is one of seventeen dioceses
                within the Anglican Province of Ibadan.
              </p>
            </Reveal>
            <Reveal delay={320} className="border-l-4 border-gold pl-6">
              <h3 className="text-lg">Current Ministry</h3>
              <p className="mt-2 text-base text-ink-muted">
                As Diocesan Bishop, he continues to provide spiritual oversight to the clergy,
                parishes, and archdeaconries of Oke-Osun, guiding the Diocese&apos;s work in
                evangelism, education, and community service from the Bishopscourt in Gbongan,
                Osun State.
              </p>
            </Reveal>
          </div>
          <p className="mt-8 text-sm text-ink-muted">
            Sourced from public Anglican Communion records. The diocesan office is welcome to
            expand or correct any detail above with first-hand information.
          </p>
        </div>
      </section>

      <section className="section bg-navy text-center text-white">
        <div className="container-diocese max-w-2xl">
          <Reveal>
            <span aria-hidden="true" className="text-4xl text-gold">✝</span>
            <p className="mt-4 text-base font-semibold uppercase tracking-[0.2em] text-gold">Episcopal Motto</p>
            <h2 className="mt-3 text-white">&ldquo;Steadfast in Faith. Forward in Purpose.&rdquo;</h2>
            <p className="mt-4 text-lg text-white/80">
              1 Corinthians 15:58<br />
              &ldquo;Be steadfast, immovable, always excelling in the work of the Lord…&rdquo;
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-white"><div className="container-diocese max-w-4xl"><Reveal><p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">A Message from the Bishop</p><p className="mt-4 text-lg text-ink-muted">Dear Brothers and Sisters in Christ, it is my joy to welcome you to the official website of the Diocese of Oke-Osun. Our Diocese remains committed to the proclamation of the saving Gospel of Jesus Christ, the teaching of God&apos;s Holy Word, the celebration of the Sacraments, and the extension of God&apos;s love to all people.</p><p className="mt-4 text-lg text-ink-muted">As you explore this website, I pray that you will discover opportunities for worship, fellowship, discipleship, evangelism, and Christian service. May the Lord richly bless you.</p><p className="mt-6 text-xl font-semibold text-navy">The Rt. Rev. Oluwagbemiro Ayodele Fabuluje.</p></Reveal></div></section>
    </>
  );
}
