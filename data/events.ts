import { Event } from '@/types';

export const events: Event[] = [
  {
    id: 'evt-001',
    title: 'Diocesan Harvest & Thanksgiving Service',
    slug: 'diocesan-harvest-thanksgiving-service',
    date: '2026-11-08',
    time: '9:00 AM',
    location: 'Cathedral Church of the Advent, Ilesa',
    description:
      'The Diocese gathers for our annual Harvest and Thanksgiving service, celebrating God\'s provision over the past year with worship, giving, and fellowship.',
    organizer: 'Diocesan Secretariat',
    image: '/images/hero1.png',
    registrationRequired: false,
  },
  {
    id: 'evt-002',
    title: 'Diocesan Youth Retreat',
    slug: 'diocesan-youth-retreat',
    date: '2026-12-18',
    time: '8:00 AM',
    location: 'St. Mark\'s Retreat Centre, Ipetu-Ijesa',
    description:
      'Three days of worship, teaching, and fellowship for young people across the Diocese, ahead of the new year.',
    organizer: 'Anglican Youth Fellowship (AYF)',
    image: '/images/hero2.png',
    registrationRequired: true,
    registrationUrl: '/programs/diocesan-youth-retreat',
  },
  {
    id: 'evt-003',
    title: 'Mothers\' Union Prayer Conference',
    slug: 'mothers-union-prayer-conference',
    date: '2026-09-26',
    time: '10:00 AM',
    location: 'Archdeaconry Hall, Ijeshaland',
    description: 'A day of prayer, testimony, and teaching for members of the Mothers\' Union.',
    organizer: 'Diocesan Mothers\' Union',
    image: '/images/hero3.png',
    registrationRequired: false,
  },
];
