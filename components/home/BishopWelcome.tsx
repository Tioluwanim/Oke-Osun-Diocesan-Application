import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';

export default function BishopWelcome() {
  return (
    <section className="section bg-cream">
      <div className="container-diocese grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal variant="left" className="relative overflow-hidden rounded-card shadow-diocese">
          <Image src="/images/hero2.png" alt="The Diocesan Bishop" width={620} height={760} className="h-full w-full object-cover" />
        </Reveal>

        <Reveal variant="right" delay={120}>
          <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">Bishop’s Welcome</p>
          <h2 className="mt-3">The Rt. Rev. Oluwagbemiro Ayodele Fabuluje</h2>
          <p className="mt-4 text-lg text-ink-muted">
            Dear Brothers and Sisters in Christ, it is my joy to welcome you to the official
            website of the Diocese of Oke-Osun. Our Diocese remains committed to the proclamation
            of the saving Gospel of Jesus Christ, the teaching of God&apos;s Holy Word, the
            celebration of the Sacraments, and the extension of God&apos;s love to all people.
          </p>
          <p className="mt-4 text-lg text-ink-muted">
            As you explore this website, I pray that you will discover opportunities for worship,
            fellowship, discipleship, evangelism, and Christian service. May the Lord richly bless
            you.
          </p>
          <Link href="/about/bishop" className="btn-secondary mt-8 inline-flex">
            Read Full Message
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
