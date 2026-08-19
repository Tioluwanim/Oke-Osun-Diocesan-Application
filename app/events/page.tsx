import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EventCard from '@/components/cards/EventCard';
import EmptyState from '@/components/ui/EmptyState';
import { getEvents } from '@/lib/api';

export const metadata: Metadata = { title: 'Events' };

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <>
      <PageHero title="Events" subtitle="What's happening across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Events' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          {events.length === 0 ? (
            <EmptyState title="No upcoming events at the moment." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
