import type { Metadata } from 'next';
import EmptyState from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Admin · Registrations' };

export default function AdminRegistrationsPage() {
  return (
    <section className="section bg-white">
      <div className="container-diocese">
        <h1>Registrations & Hostel Assignments</h1>
        <div className="mt-6">
          <EmptyState
            title="No registrations to display."
            message="Registration records live on the backend once it is connected — this view will list them with hostel and room assignment controls."
          />
        </div>
      </div>
    </section>
  );
}
