import Image from 'next/image';
import HeroSlideshow from '@/components/ui/HeroSlideshow';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  images?: string[];
  badge?: string;
}

const DEFAULT_IMAGES = ['/images/hero1.png', '/images/hero2.png', '/images/hero3.png'];

export default function PageHero({ title, subtitle, image, images, badge = 'Est. 1993' }: PageHeroProps) {
  const slides = images ?? (image ? [image] : DEFAULT_IMAGES);

  return (
    <section className="bg-cream py-4 sm:py-6">
      <div className="container-diocese">
        <div className="relative isolate overflow-hidden rounded-card bg-navy py-14 shadow-diocese sm:py-20 lg:py-24">
          <HeroSlideshow images={slides} priority />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/55 via-navy/60 to-navy/80" />

          {badge && (
            <div className="reveal reveal-visible absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-4 backdrop-blur-sm sm:left-6 sm:top-6">
              <Image src="/images/logo-transparent.png" alt="" width={28} height={28} className="h-7 w-7" />
              <span className="text-sm font-semibold text-white/90">{badge}</span>
            </div>
          )}

          <div className="container-diocese text-center">
            <h1 className="reveal reveal-visible text-white">{title}</h1>
            {subtitle && (
              <p className="reveal reveal-visible mx-auto mt-3 max-w-2xl text-base text-white/90 [animation-delay:100ms] sm:mt-4 sm:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
