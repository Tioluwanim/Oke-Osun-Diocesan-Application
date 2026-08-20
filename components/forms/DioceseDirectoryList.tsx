import { Diocese } from '@/types';

export default function DioceseDirectoryList({ dioceses }: { dioceses: Diocese[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {dioceses.map((d) => (
        <li key={d.name} className="card p-5">
          <p className="font-semibold text-navy text-lg">{d.name}</p>
          <p className="text-base text-ink-muted">{d.province}</p>
          {d.website ? (
            <a
              href={d.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-base font-semibold text-blue hover:text-gold"
            >
              Visit website →
            </a>
          ) : (
            <p className="mt-2 text-base text-ink-muted italic">Website not yet listed</p>
          )}
        </li>
      ))}
    </ul>
  );
}
