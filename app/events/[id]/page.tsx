import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getEvent, getEvents } from '@/lib/api';

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const event = await getEvent(params.id);
  return { title: event?.title ?? 'Event' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  return (
    <>
      <PageHero title={event.title} subtitle={formatDate(event.date)} image={event.image} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Events', href: '/events' }, { label: event.title }]} />
      <section className="section bg-white">
        <div className="container-diocese max-w-3xl">
          <dl className="mb-8 grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-semibold uppercase text-ink-muted">Date</dt>
              <dd className="text-lg text-navy">{formatDate(event.date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase text-ink-muted">Time</dt>
              <dd className="text-lg text-navy">{event.time}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase text-ink-muted">Location</dt>
              <dd className="text-lg text-navy">{event.location}</dd>
            </div>
          </dl>
          <p className="text-lg leading-relaxed text-ink-muted">{event.description}</p>
          {event.registrationRequired && event.registrationUrl && (
            <Link href={event.registrationUrl} className="btn-primary mt-8 inline-flex">
              Register Now
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
