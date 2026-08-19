import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EventCard from '@/components/cards/EventCard';
import ProgramCard from '@/components/cards/ProgramCard';
import EmptyState from '@/components/ui/EmptyState';
import { getEvents, getPrograms } from '@/lib/api';

export const metadata: Metadata = { title: 'Events & Programs' };

export default async function EventsPage() {
  const [events, programs] = await Promise.all([getEvents(), getPrograms()]);
  return (
    <>
      <PageHero title="Events & Programs" subtitle="Worship, fellowship, retreats, and ministry opportunities across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Events & Programs' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          <div className="flex flex-col gap-12">
            <div>
              <h2 className="mb-6">Upcoming Events</h2>
              {events.length === 0 ? <EmptyState title="No upcoming events at the moment." /> : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </div>
            <div>
              <h2 className="mb-6">Programs & Registration</h2>
              {programs.length === 0 ? <EmptyState title="No programs are currently open for registration." /> : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {programs.map((program) => <ProgramCard key={program.id} program={program} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
