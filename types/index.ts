export interface Event {
  id: string;
  title: string;
  slug: string;
  date: string; // ISO date
  time: string;
  location: string;
  description: string;
  organizer: string;
  image?: string;
  registrationRequired: boolean;
  registrationUrl?: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  scripture: string;
  description: string;
  audioUrl?: string;
  videoUrl?: string;
  youtubeId?: string;
  downloadUrl?: string;
  image?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  body: string;
  date: string;
  category: string;
  author: string;
  image?: string;
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  type: 'retreat' | 'camp' | 'conference' | 'seminar' | 'other';
  description: string;
  date: string;
  endDate?: string;
  location: string;
  eligibility: string;
  registrationDeadline: string;
  availablePlaces: number;
  totalPlaces: number;
  schedule: { time: string; activity: string }[];
  fee?: string;
  image?: string;
}

export interface Registration {
  id: string;
  programId: string;
  name: string;
  phone: string;
  email: string;
  parish: string;
  groupAffiliation?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  hostel?: string;
  room?: string;
  checkIn?: string;
  qrData?: string;
  createdAt: string;
}

export interface ClergyMember {
  id: string;
  name: string;
  title: string;
  parish: string;
  archdeaconry: string;
  photo?: string;
  email?: string;
  phone?: string;
  biography?: string;
}

export interface Diocese {
  name: string;
  province: string;
  website: string;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  parentSlug?: string;
  description: string;
  meetingInfo?: string;
  image?: string;
}

export interface Archdeaconry {
  id: string;
  name: string;
  slug: string;
  archdeacon: string;
  parishCount: number;
  description: string;
  headquarters: string;
}

export type LoadState = 'loading' | 'success' | 'empty' | 'error' | 'offline';
