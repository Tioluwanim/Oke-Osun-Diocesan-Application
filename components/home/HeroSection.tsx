import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-cream py-4 sm:py-6">
      <div className="container-diocese">
        <div className="cinematic-hero relative isolate overflow-hidden rounded-card bg-navy shadow-diocese">
          <Image
            src="/images/hero1.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10 object-cover opacity-55"
          />
          <div className="hero-vignette absolute inset-0 -z-10 bg-gradient-to-b from-navy/40 via-navy/55 to-navy/70" />
          <div className="flex min-h-[42vh] flex-col items-center justify-center gap-5 px-4 py-12 text-center sm:min-h-[50vh] sm:px-8 sm:py-16">
            <p className="reveal reveal-visible text-xs font-semibold uppercase tracking-[0.2em] text-gold sm:text-sm">
              Church of Nigeria - Anglican Communion
            </p>
            <h1 className="reveal reveal-visible text-white [animation-delay:80ms]">Diocese of Oke-Osun</h1>
            <p className="reveal reveal-visible max-w-2xl text-base text-white/90 [animation-delay:160ms] sm:text-lg">
              Proclaiming the Gospel of Jesus Christ through worship, evangelism, discipleship, and
              compassionate service across our archdeaconries and parishes.
            </p>
            <div className="reveal reveal-visible flex w-full flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row sm:gap-4">
              <Link href="/about" className="btn-primary w-full sm:w-auto">
                Discover Our Diocese
              </Link>
              <Link href="/contact" className="btn-outline w-full sm:w-auto">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
