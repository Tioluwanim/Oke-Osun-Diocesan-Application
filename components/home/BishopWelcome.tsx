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
          <h2 className="mt-3">The Rt. Rev. Oluwagbemiro Ayodele and L/Evang. Lydia Aderinsola Fabuluje</h2>
          <p className="mt-4 text-lg text-ink-muted">
            We welcome you to the official website of the Diocese of Oke-Osun, Church of Nigeria
            (Anglican Communion). We are delighted to have you visit our online community where
            faith, worship, evangelism, and service remain our priority.
          </p>
          <p className="mt-4 text-lg text-ink-muted">
            Our Diocese is committed to proclaiming the Gospel of Jesus Christ, nurturing believers,
            and transforming lives through sound biblical teaching and compassionate ministry.
          </p>
          <Link href="/about/bishop" className="btn-secondary mt-8 inline-flex">
            Read Full Message
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
