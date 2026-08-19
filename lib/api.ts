/**
 * Typed API layer for the Diocese of Oke-Osun website.
 *
 * Every function currently resolves from local fixtures in /data so the UI can be
 * built and demoed without a backend. Each function is written the way it would look
 * once wired to the FastAPI backend (see the commented fetch() call), so swapping the
 * data source later is a one-line change per function, not a UI rewrite.
 */
import { events } from '@/data/events';
import { sermons } from '@/data/sermons';
import { news } from '@/data/news';
import { programs } from '@/data/programs';
import { clergy } from '@/data/clergy';
import { dioceses } from '@/data/dioceses';
import { groups } from '@/data/groups';
import { archdeaconries } from '@/data/archdeaconries';
import type {
  Event, Sermon, NewsArticle, Program, Registration, ClergyMember, Diocese, Group, Archdeaconry,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Simulated network latency so loading states are visible in dev. Set to 0 in production
// once real network calls replace these.
const FIXTURE_DELAY_MS = 0;

async function resolve<T>(value: T): Promise<T> {
  if (FIXTURE_DELAY_MS > 0) {
    await new Promise((r) => setTimeout(r, FIXTURE_DELAY_MS));
  }
  return value;
  // Once the backend is live, functions below become:
  // const res = await fetch(`${API_URL}/events`, { next: { revalidate: 60 } });
  // if (!res.ok) throw new Error('Failed to load events');
  // return res.json();
}

export async function getEvents(): Promise<Event[]> {
  return resolve(events);
}

export async function getEvent(id: string): Promise<Event | undefined> {
  return resolve(events.find((e) => e.id === id || e.slug === id));
}

export async function getSermons(): Promise<Sermon[]> {
  return resolve(sermons);
}

export async function getSermon(id: string): Promise<Sermon | undefined> {
  return resolve(sermons.find((s) => s.id === id));
}

export async function getNews(): Promise<NewsArticle[]> {
  return resolve(news);
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | undefined> {
  return resolve(news.find((n) => n.slug === slug));
}

export async function getPrograms(): Promise<Program[]> {
  return resolve(programs);
}

export async function getProgram(id: string): Promise<Program | undefined> {
  return resolve(programs.find((p) => p.id === id || p.slug === id));
}

export async function submitRegistration(
  data: Omit<Registration, 'id' | 'status' | 'createdAt' | 'qrData'>
): Promise<Registration> {
  // Real implementation: POST to `${API_URL}/registrations` and return the backend record,
  // including server-assigned hostel/room allocation and qrData.
  const registration: Registration = {
    ...data,
    id: `DOS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    qrData: `${data.programId}:${data.email}`,
  };
  return resolve(registration);
}

export async function getRegistration(id: string): Promise<Registration | undefined> {
  // Placeholder only — a real lookup requires the backend, since registrations aren't
  // persisted anywhere in the frontend fixtures.
  return resolve(undefined);
}

export async function getDioceseLinks(): Promise<Diocese[]> {
  return resolve(dioceses);
}

export async function getClergy(): Promise<ClergyMember[]> {
  return resolve(clergy);
}

export async function getGroups(): Promise<Group[]> {
  return resolve(groups);
}

export async function getArchdeaconries(): Promise<Archdeaconry[]> {
  return resolve(archdeaconries);
}

export async function getArchdeaconry(slug: string): Promise<Archdeaconry | undefined> {
  return resolve(archdeaconries.find((a) => a.slug === slug));
}
