import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-line bg-cream">
      <ol className="container-diocese flex flex-wrap items-center gap-2 py-3 text-base text-ink-muted">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-gold">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-navy" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
