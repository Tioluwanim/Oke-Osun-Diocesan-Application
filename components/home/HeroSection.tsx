import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      <Image
        src="/images/hero1.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover opacity-40"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/70 via-navy/80 to-navy" />
      <div className="container-diocese flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-gold">
          Church of Nigeria — Anglican Communion
        </p>
        <h1 className="animate-fade-up text-white [animation-delay:80ms]">Diocese of Oke-Osun</h1>
        <p className="animate-fade-up max-w-2xl text-lg text-white/85 [animation-delay:160ms]">
          Proclaiming the Gospel of Jesus Christ through worship, evangelism, discipleship, and
          compassionate service across our archdeaconries and parishes.
        </p>
        <div className="animate-fade-up flex flex-wrap items-center justify-center gap-4 [animation-delay:240ms]">
          <Link href="/about" className="btn-primary">
            Discover Our Diocese
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
