import Link from 'next/link';
import Image from 'next/image';
import HeroSlideshow from '@/components/ui/HeroSlideshow';

const HERO_IMAGES = [
  '/images/hero1.png',
  '/images/hero2.png',
  '/images/hero3.png',
  '/images/hero4.png',
  '/images/hero5.png',
];

export default function HeroSection() {
  return (
    <section className="bg-cream px-3 py-4 sm:px-5 sm:py-6">
      <div className="container-diocese">
        <div className="cinematic-hero relative isolate overflow-hidden rounded-card bg-navy shadow-diocese">
          
          <HeroSlideshow images={HERO_IMAGES} priority />

          {/* Main cinematic overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-navy/40 via-navy/55 to-navy/85" />

          {/* Soft side vignette */}
          <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(10,25,47,0.28)_100%)]" />

          {/* Badge */}
          <div className="absolute left-5 top-5 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 py-1.5 pl-1.5 pr-4 backdrop-blur-md sm:left-7 sm:top-7">
            <Image
              src="/images/logo-transparent.png"
              alt=""
              width={30}
              height={30}
              className="h-7 w-7 sm:h-8 sm:w-8"
            />

            <span className="text-sm font-semibold text-white/90">
              Est. 1993
            </span>
          </div>

          {/* Main content */}
          <div className="relative z-20 flex min-h-[520px] flex-col items-center justify-center px-5 py-24 text-center sm:min-h-[580px] sm:px-10 lg:min-h-[620px]">
            
            <p className="reveal reveal-visible mb-5 text-sm font-bold uppercase tracking-[0.22em] text-gold sm:text-base">
              Church of Nigeria — Anglican Communion
            </p>

            <h1 className="reveal reveal-visible max-w-5xl text-white [animation-delay:80ms]">
              Diocese of Oke-Osun
            </h1>

            <p className="reveal reveal-visible mt-5 max-w-3xl text-base leading-7 text-white/85 [animation-delay:160ms] sm:text-lg sm:leading-8">
              Proclaiming the Gospel of Jesus Christ through worship,
              evangelism, discipleship, and compassionate service across
              our archdeaconries and parishes.
            </p>

            <div className="reveal reveal-visible mt-8 flex w-full flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row sm:gap-4">
              <Link
                href="/about"
                className="btn-primary w-full sm:w-auto"
              >
                Discover Our Diocese
              </Link>

              <Link
                href="/contact"
                className="btn-outline w-full sm:w-auto"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 text-white/60"
            aria-hidden="true"
          >
            <span className="text-2xl">⌄</span>
          </div>
        </div>
      </div>
    </section>
  );
}
