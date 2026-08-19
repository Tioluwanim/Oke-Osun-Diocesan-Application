import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Events & Programs' };

export default function ProgramsPage() {
  redirect('/events');
}
