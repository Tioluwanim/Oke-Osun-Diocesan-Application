import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

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
          <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-card shadow-diocese">
            <Image src="/images/bishop.png" alt="The Bishop of Oke-Osun Diocese" fill className="object-cover" />
          </div>
          <div>
            <h2>The Rt. Rev. (Dr.) Bishop of Oke-Osun</h2>
            <p className="mt-4 text-lg text-ink-muted">
              The Bishop leads the Diocese in worship, teaching, and pastoral oversight, guiding
              clergy and laity in the mission of the Church across all archdeaconries.
            </p>
            <p className="mt-4 text-lg text-ink-muted">
              Under his leadership, the Diocese continues to grow in discipleship, evangelism, and
              community service, with a heart for raising godly leaders for the next generation.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
