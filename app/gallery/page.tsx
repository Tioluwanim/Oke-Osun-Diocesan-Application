import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = { title: 'Gallery' };

const IMAGES = ['/images/hero1.png', '/images/hero2.png', '/images/hero3.png', '/images/hero4.png', '/images/hero5.png', '/images/events.png'];

export default function GalleryPage() {
  return (
    <>
      <PageHero title="Gallery" subtitle="Moments from across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]} />
      <section className="section bg-white">
        <div className="container-diocese grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {IMAGES.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-card shadow-soft">
              <Image
                src={src}
                alt=""
                fill
                loading={i < 4 ? 'eager' : 'lazy'}
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-diocese-ease hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
