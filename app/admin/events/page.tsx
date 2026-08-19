import type { Metadata } from 'next';
import { getEvents } from '@/lib/api';

export const metadata: Metadata = { title: 'Admin · Events' };

export default async function AdminEventsPage() {
  const events = await getEvents();
  return (
    <section className="section bg-white">
      <div className="container-diocese">
        <h1>Manage Events</h1>
        <div className="mt-6 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-cream">
              <tr>
                <th className="p-4 font-semibold text-navy">Title</th>
                <th className="p-4 font-semibold text-navy">Date</th>
                <th className="p-4 font-semibold text-navy">Location</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="p-4">{e.title}</td>
                  <td className="p-4">{e.date}</td>
                  <td className="p-4">{e.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
