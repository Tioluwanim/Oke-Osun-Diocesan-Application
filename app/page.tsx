import Link from 'next/link';
import HeroSection from '@/components/home/HeroSection';
import WelcomeSection from '@/components/home/WelcomeSection';
import BishopWelcome from '@/components/home/BishopWelcome';
import StatsSection from '@/components/home/StatsSection';
import NewsHighlights from '@/components/home/NewsHighlights';
import QuickActionCards from '@/components/home/QuickActionCards';
import GalleryPreview from '@/components/home/GalleryPreview';
import LandingLinks from '@/components/home/LandingLinks';

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

      <section className="bg-navy py-16 text-center text-white">
        <div className="container-diocese">
          <h2 className="text-white">Partner With Us in Ministry</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Your tithes, offerings, and gifts sustain the mission and ministries of the Diocese.
          </p>
          <Link href="/give" className="btn-primary mt-6 inline-flex">
            Give Now
          </Link>
        </div>
      </section>
    </>
  );
}
