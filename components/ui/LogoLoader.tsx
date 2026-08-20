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
  showLabel?: boolean;
  className?: string;
}

export default function LogoLoader({
  size = 'md',
  label = 'Loading…',
  showLabel = true,
  className = '',
}: LogoLoaderProps) {
  const px = SIZE_MAP[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} role="status" aria-live="polite">
      <span
        className="loader-stage relative inline-flex items-center justify-center rounded-full border border-gold/40 bg-white/70 shadow-[0_0_0_8px_rgba(201,162,39,0.08)]"
        style={{ width: px, height: px }}
      >
        <span className="loader-orbit absolute inset-[-8%] rounded-full border-2 border-transparent border-t-gold border-r-gold/50" />
        <span className="loader-orbit loader-orbit-delayed absolute inset-[10%] rounded-full border border-transparent border-b-blue border-l-gold/60" />
        <span className="absolute inset-[22%] rounded-full bg-gold/10 animate-pulse" />
        <Image
          src="/images/logo-transparent.png"
          alt=""
          width={px}
          height={px}
          priority={size === 'lg'}
          className="relative z-10 h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(6,26,53,0.22)]"
        />
      </span>
      {showLabel && (
        <span className={size === 'sm' ? 'text-base text-ink-muted' : 'text-base text-ink-muted'}>
          {label}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FullPageLoader({ label = 'Loading the page…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(201,162,39,0.12),_transparent_45%),_linear-gradient(135deg,_#f8f6ef_0%,_#eef3f9_100%)] px-4 py-10">
      <div className="loader-panel flex flex-col items-center justify-center gap-6 rounded-[28px] border border-gold/30 bg-white/70 px-8 py-9 shadow-[0_24px_70px_rgba(6,26,53,0.12)] backdrop-blur-sm">
        <LogoLoader size="lg" showLabel={false} />
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-semibold text-navy">{label}</p>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-2.5 w-2.5 rounded-full bg-gold animate-pulse"
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
