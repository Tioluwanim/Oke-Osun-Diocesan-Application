import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SectionHeader from '@/components/ui/SectionHeader';

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
          <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-diocese">
            <Image src="/images/hero3.png" alt="" fill className="object-cover" />
          </div>
          <div>
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
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-diocese grid gap-6 sm:grid-cols-2">
          <div className="card p-8">
            <h2>Our Vision</h2>
            <p className="mt-3 text-ink-muted">
              A Diocese of vibrant, Christ-centered parishes making disciples and transforming
              communities across Ijeshaland and beyond.
            </p>
          </div>
          <div className="card p-8">
            <h2>Our Mission</h2>
            <p className="mt-3 text-ink-muted">
              To proclaim the Gospel, nurture disciples, raise godly leadership, and serve our
              communities in the love of Christ.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
