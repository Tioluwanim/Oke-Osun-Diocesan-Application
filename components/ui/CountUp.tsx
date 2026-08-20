'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: string;
  durationMs?: number;
  className?: string;
}

/**
 * Animates a stat number counting up from 0 to its target once it scrolls
 * into view. Only the numeric part animates — any non-numeric characters
 * (like a trailing "+") are preserved and reattached after the count finishes.
 *
 * Respects prefers-reduced-motion: jumps straight to the final value instead
 * of animating, since a rapidly changing number is exactly the kind of
 * motion that setting is meant to suppress.
 */
export default function CountUp({ value, durationMs = 1600, className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('0');

  const numericMatch = value.match(/[\d,]+/);
  const target = numericMatch ? parseInt(numericMatch[0].replace(/,/g, ''), 10) : 0;
  const suffix = numericMatch ? value.slice((numericMatch.index ?? 0) + numericMatch[0].length) : '';
  const prefix = numericMatch ? value.slice(0, numericMatch.index ?? 0) : value;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        if (prefersReducedMotion || !numericMatch) {
          setDisplay(target.toLocaleString());
          return;
        }

        const startTime = performance.now();
        const step = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          // ease-out cubic, matches the site's existing --ease-diocese-ease feel
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * target).toLocaleString());
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
