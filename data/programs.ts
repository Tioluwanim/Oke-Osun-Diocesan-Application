import { Program } from '@/types';

export const programs: Program[] = [
  {
    id: 'prog-001',
    title: 'Diocesan Youth Retreat',
    slug: 'diocesan-youth-retreat',
    type: 'retreat',
    description:
      'A three-day retreat for young people across the Diocese, featuring worship, Bible teaching, workshops, and fellowship.',
    date: '2026-12-18',
    endDate: '2026-12-20',
    location: 'St. Mark\'s Retreat Centre, Ipetu-Ijesa',
    eligibility: 'Ages 15-30, members of any parish in the Diocese',
    registrationDeadline: '2026-12-05',
    availablePlaces: 64,
    totalPlaces: 200,
    fee: '\u20a65,000',
    schedule: [
      { time: 'Day 1, 2:00 PM', activity: 'Arrival & registration' },
      { time: 'Day 1, 6:00 PM', activity: 'Opening worship' },
      { time: 'Day 2, 9:00 AM', activity: 'Morning teaching sessions' },
      { time: 'Day 3, 10:00 AM', activity: 'Closing service & departure' },
    ],
    image: '/images/hero2.png',
  },
  {
    id: 'prog-002',
    title: 'Clergy Wives Annual Seminar',
    slug: 'clergy-wives-annual-seminar',
    type: 'seminar',
    description: 'An annual seminar equipping clergy wives for ministry alongside their husbands.',
    date: '2026-10-14',
    location: 'Diocesan Secretariat, Ilesa',
    eligibility: 'Wives of clergy in the Diocese',
    registrationDeadline: '2026-10-01',
    availablePlaces: 40,
    totalPlaces: 80,
    schedule: [
      { time: '9:00 AM', activity: 'Registration & welcome' },
      { time: '10:00 AM', activity: 'Keynote session' },
      { time: '1:00 PM', activity: 'Lunch & fellowship' },
    ],
    image: '/images/hero4.png',
  },
];
