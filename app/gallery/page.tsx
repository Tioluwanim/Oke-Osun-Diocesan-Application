import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = { title: 'Gallery' };

const GALLERY_ITEMS = [
  { src: '/images/hero1.png', title: 'Diocesan Synod 2026', category: 'synod' },
  { src: '/images/hero2.png', title: 'Youth Conference', category: 'youth' },
  { src: '/images/hero3.png', title: 'Ordination Service', category: 'ordination' },
  { src: '/images/hero4.png', title: 'Mothers’ Union', category: 'mothers' },
  { src: '/images/hero5.png', title: 'Harvest Thanksgiving', category: 'harvest' },
  { src: '/images/events.png', title: 'Diocesan School Outreach', category: 'schools' },
  { src: '/images/hero1.png', title: 'Choir Festival', category: 'youth' },
  { src: '/images/hero2.png', title: 'Children’s Ministry', category: 'schools' },
  { src: '/images/hero3.png', title: 'Bishop’s Visit', category: 'synod' },
];

export default function GalleryPage() {
  return (
    <>
      <PageHero title="Photo & Video Gallery" subtitle="Capturing the life and ministry of the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          <div className="mb-8 flex flex-wrap gap-3 text-base font-semibold text-navy">
            {['All', 'Synod', 'Youth', 'Mothers', 'Ordination', 'Harvest', 'Schools'].map((label, index) => (
              <span key={label} className={`rounded-full border px-4 py-2 ${index === 0 ? 'border-gold bg-gold text-navy' : 'border-line bg-cream text-ink-muted'}`}>
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {GALLERY_ITEMS.map((item, i) => (
              <div key={`${item.title}-${i}`} className="group relative aspect-square overflow-hidden rounded-card border border-line bg-cream shadow-soft">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  loading={i < 4 ? 'eager' : 'lazy'}
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-diocese-ease group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-3">
                  <span className="text-base font-medium text-white">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
