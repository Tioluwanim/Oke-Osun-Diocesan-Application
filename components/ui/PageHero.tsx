import Image from 'next/image';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
}

export default function PageHero({ title, subtitle, image = '/images/hero1.png' }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-navy py-20 sm:py-28">
      <Image
        src={image}
        alt=""
        fill
        priority
        className="absolute inset-0 -z-10 object-cover opacity-30"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/80 via-navy/70 to-navy" />
      <div className="container-diocese text-center">
        <h1 className="text-white animate-fade-up">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85 animate-fade-up [animation-delay:100ms]">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
