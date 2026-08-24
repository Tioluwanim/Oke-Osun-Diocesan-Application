import Link from 'next/link';
import HeroSection from '@/components/home/HeroSection';
import WelcomeSection from '@/components/home/WelcomeSection';
import BishopWelcome from '@/components/home/BishopWelcome';
import StatsSection from '@/components/home/StatsSection';
import NewsHighlights from '@/components/home/NewsHighlights';
import QuickActionCards from '@/components/home/QuickActionCards';
import GalleryPreview from '@/components/home/GalleryPreview';
import LandingLinks from '@/components/home/LandingLinks';
import Reveal from '@/components/ui/Reveal';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WelcomeSection />
      <BishopWelcome />
      <StatsSection />
      <NewsHighlights />
      <QuickActionCards />
      <GalleryPreview />
      <LandingLinks />

      <section className="relative overflow-hidden bg-navy py-16 text-center text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-12 -bottom-16 select-none text-[14rem] leading-none text-gold/[0.06]">
          ❤
        </span>
        <div className="container-diocese relative">
          <Reveal variant="scale">
            <div className="glow-ring mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-3xl text-navy" aria-hidden="true">
              ❤
            </div>
            <h2 className="text-white">Partner With Us in Ministry</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Your tithes, offerings, and gifts sustain the mission and ministries of the Diocese.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/support" className="btn-primary w-full sm:w-auto">
                Give Now
              </Link>
              <Link href="/prayer" className="btn-outline w-full sm:w-auto">
                Send a Prayer Request
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
