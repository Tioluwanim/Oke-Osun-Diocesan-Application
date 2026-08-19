import Image from 'next/image';

type LogoLoaderSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<LogoLoaderSize, number> = {
  sm: 28,
  md: 56,
  lg: 96,
};

interface LogoLoaderProps {
  size?: LogoLoaderSize;
  label?: string;
  /** Show the status text next to/under the logo. Set false for compact inline use (e.g. inside a button). */
  showLabel?: boolean;
  className?: string;
}

/**
 * The Diocese-branded loading indicator, used everywhere a spinner would otherwise
 * appear: full-page loading, buttons, inline data fetches, payment processing.
 *
 * Motion: subtle rotation + opacity pulse via the `animate-logo-pulse` keyframe
 * (defined in tailwind.config.ts), which respects `prefers-reduced-motion` globally
 * through the base-layer override in globals.css — under reduced motion the animation
 * is effectively disabled and the logo sits static, so this component needs no
 * separate reduced-motion branch.
 */
export default function LogoLoader({
  size = 'md',
  label = 'Loading…',
  showLabel = true,
  className = '',
}: LogoLoaderProps) {
  const px = SIZE_MAP[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} role="status" aria-live="polite">
      <span className="animate-logo-pulse inline-block" style={{ width: px, height: px }}>
        <Image
          src="/images/logo.png"
          alt=""
          width={px}
          height={px}
          priority={size === 'lg'}
          className="h-full w-full object-contain"
        />
      </span>
      {showLabel && (
        <span className={size === 'sm' ? 'text-sm text-ink-muted' : 'text-base text-ink-muted'}>
          {label}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Full-page branded loading screen, used by app/loading.tsx and nested loading.tsx files. */
export function FullPageLoader({ label = 'Loading the page…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-cream">
      <LogoLoader size="lg" showLabel={false} />
      <p className="text-lg font-medium text-navy">{label}</p>
    </div>
  );
}
