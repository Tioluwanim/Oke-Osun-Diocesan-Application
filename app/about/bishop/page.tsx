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
              The Bishop leads the Diocese in worship, teaching, and pastoral oversight, guiding
              clergy and laity in the mission of the Church across all archdeaconries.
            </p>
            <p className="mt-4 text-lg text-ink-muted">
              Under his leadership, the Diocese continues to grow in discipleship, evangelism, and
              community service, with a heart for raising godly leaders for the next generation.
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

      <section className="section bg-white"><div className="container-diocese max-w-4xl"><Reveal><p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">A Message from the Bishop</p><h2 className="mt-3">Leading with faith, service, and hope</h2><p className="mt-4 text-lg text-ink-muted">The Diocese is called to proclaim Christ faithfully, nurture believers deeply, and serve our neighbours generously. Every parish, ministry, and institution has a part to play in this shared calling.</p><p className="mt-4 text-lg text-ink-muted">As we grow, we remain committed to prayer, sound teaching, compassionate leadership, and the raising of godly leaders for the next generation.</p><div className="mt-8 rounded-card border border-gold/30 bg-cream p-6"><p className="text-xl text-navy">“I am among you as one who serves.”</p><p className="mt-2 text-base font-semibold uppercase tracking-[0.2em] text-ink-muted">Luke 22:27</p></div></Reveal></div></section>
    </>
  );
}
