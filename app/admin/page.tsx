import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Admin' };

const SECTIONS = [
  { name: 'Events', href: '/admin/events', blurb: 'Create and manage diocesan events.' },
  { name: 'Registrations', href: '/admin/registrations', blurb: 'Review program registrations and hostel assignments.' },
  { name: 'News', href: '#', blurb: 'Publish diocesan news and announcements.' },
  { name: 'Sermons', href: '#', blurb: 'Upload and manage sermon audio/video.' },
  { name: 'Programs', href: '#', blurb: 'Manage retreats, camps, and conferences.' },
  { name: 'Clergy Approvals', href: '#', blurb: 'Approve clergy directory submissions.' },
  { name: 'Diocese Links', href: '#', blurb: 'Manage the diocese directory.' },
];

/**
 * NOTE: This is a UI scaffold only. `is_admin` must be verified server-side by the
 * FastAPI backend on every admin request/mutation — this page does not (and must not)
 * enforce authorization on its own, since client-side hiding is not real security.
 */
export default function AdminHomePage() {
  return (
    <section className="section bg-cream">
      <div className="container-diocese">
        <h1>Admin Panel</h1>
        <p className="mt-2 max-w-xl text-ink-muted">
          Manage diocesan content. Access here is a placeholder — the production build must
          enforce <code>is_admin</code> on the server for every request below.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link key={s.name} href={s.href} className="card flex flex-col gap-2 p-6">
              <h3 className="text-lg">{s.name}</h3>
              <p className="text-base text-ink-muted">{s.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
