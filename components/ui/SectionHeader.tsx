interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({ eyebrow, title, description, align = 'center' }: SectionHeaderProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-2xl ${alignment} mb-10`}>
      {eyebrow && (
        <p className="mb-2 text-base font-semibold uppercase tracking-[0.15em] text-gold">{eyebrow}</p>
      )}
      <h2>{title}</h2>
      {description && <p className="mt-3 text-lg text-ink-muted">{description}</p>}
    </div>
  );
}
