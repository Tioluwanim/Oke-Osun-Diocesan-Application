'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface HeroSlideshowProps {
  images: string[];
  intervalMs?: number;
  priority?: boolean;
}

/**
 * Cycles through a set of background images with a slow crossfade, used
 * behind the hero/page-header text. Falls back to a single static image
 * (no rotation, no transition) under prefers-reduced-motion, since a slowly
 * shifting background is still motion that setting is meant to suppress.
 */
export default function HeroSlideshow({ images, intervalMs = 6000, priority = false }: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs, reducedMotion]);

  const visibleImages = reducedMotion ? images.slice(0, 1) : images;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {visibleImages.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={priority && index === 0}
          sizes="100vw"
          className={`object-cover opacity-55 transition-opacity duration-[1800ms] ease-in-out ${
            reducedMotion || index === activeIndex ? 'opacity-55' : 'opacity-0'
          }`}
          style={{ transitionProperty: 'opacity' }}
        />
      ))}
      {images.length > 1 && !reducedMotion && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Background image selector">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show background image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 min-h-[8px] w-2 rounded-full transition-all ${
                index === activeIndex ? 'w-6 bg-gold' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
