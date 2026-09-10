'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface HeroSlideshowProps {
  images: string[];
  intervalMs?: number;
  priority?: boolean;
}

export default function HeroSlideshow({
  images,
  intervalMs = 6000,
  priority = false,
}: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    setReducedMotion(query.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    query.addEventListener('change', handler);

    return () => {
      query.removeEventListener('change', handler);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || images.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [images.length, intervalMs, reducedMotion]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={priority && index === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1800ms] ease-in-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Cinematic darkness */}
      <div className="absolute inset-0 bg-navy/55" />

      {/* Extra edge darkening */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(10,25,47,0.35)_100%)]" />

      {images.length > 1 && !reducedMotion && (
        <div
          className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
          role="tablist"
          aria-label="Background image selector"
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show background image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-7 bg-gold'
                  : 'w-2 bg-white/45 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
