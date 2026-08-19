import Image from 'next/image';
import Link from 'next/link';

const GALLERY_PREVIEW = ['/images/hero1.png', '/images/hero2.png', '/images/hero3.png'];

export default function GalleryPreview() {
  return (
    <section className="section bg-cream">
      <div className="container-diocese">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Photo Gallery</p>
          <h2 className="mt-3">Life in Oke-Osun Diocese</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {GALLERY_PREVIEW.map((src, index) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-card shadow-soft">
              <Image src={src} alt="Diocese gallery" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
              {index === 2 && (
                <div className="absolute inset-0 flex items-center justify-center bg-navy/30">
                  <Link href="/gallery" className="btn-primary">View Full Gallery</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
