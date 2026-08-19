import Image from 'next/image';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
}

export default function PageHero({ title, subtitle, image = '/images/hero1.png' }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-navy py-14 sm:py-20 lg:py-24">
      <Image
        src={image}
        alt=""
        fill
        priority
        className="absolute inset-0 -z-10 object-cover opacity-40"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/70 via-navy/60 to-navy/85" />
      <div className="container-diocese text-center">
        <h1 className="text-white animate-fade-up">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/90 animate-fade-up [animation-delay:100ms] sm:mt-4 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
