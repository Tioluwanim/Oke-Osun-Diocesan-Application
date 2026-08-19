import { Diocese } from '@/types';

export default function DioceseDirectoryList({ dioceses }: { dioceses: Diocese[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {dioceses.map((d) => (
        <li key={d.name} className="card p-5">
          <p className="font-semibold text-navy">{d.name}</p>
          <p className="text-sm text-ink-muted">{d.province}</p>
          <a
            href={d.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-semibold text-blue hover:text-gold"
          >
            Visit website →
          </a>
        </li>
      ))}
    </ul>
  );
}
