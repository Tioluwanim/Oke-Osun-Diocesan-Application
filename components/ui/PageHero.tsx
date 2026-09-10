import Image from 'next/image';
import HeroSlideshow from '@/components/ui/HeroSlideshow';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  images?: string[];
  badge?: string;
}

const DEFAULT_IMAGES = [
  '/images/hero1.png',
  '/images/hero2.png',
  '/images/hero3.png',
];

export default function PageHero({
  title,
  subtitle,
  image,
  images,
  badge = 'Est. 1993',
}: PageHeroProps) {
  const slides = images ?? (image ? [image] : DEFAULT_IMAGES);

  return (
    <section className="bg-cream px-3 py-4 sm:px-5 sm:py-6">
      <div className="container-diocese">
        <div className="relative isolate overflow-hidden rounded-card bg-navy shadow-diocese">

          <HeroSlideshow images={slides} priority />

          <div className="absolute inset-0 z-10 bg-gradient-to-b from-navy/40 via-navy/55 to-navy/85" />

          {badge && (
            <div className="absolute left-5 top-5 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 py-1.5 pl-1.5 pr-4 backdrop-blur-md sm:left-7 sm:top-7">
              <Image
                src="/images/logo-transparent.png"
                alt=""
                width={30}
                height={30}
                className="h-7 w-7 sm:h-8 sm:w-8"
              />

              <span className="text-sm font-semibold text-white/90">
                {badge}
              </span>
            </div>
          )}

          <div className="relative z-20 flex min-h-[420px] flex-col items-center justify-center px-5 py-20 text-center sm:min-h-[500px] sm:px-8 lg:min-h-[540px]">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold sm:text-base">
              Church of Nigeria — Anglican Communion
            </p>

            <h1 className="mt-4 max-w-4xl text-white">
              {title}
            </h1>

            {subtitle && (
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
