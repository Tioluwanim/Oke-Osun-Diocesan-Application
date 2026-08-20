import { ClergyMember } from '@/types';

export const clergy: ClergyMember[] = [
  {
    id: 'clg-001',
    name: 'Ven. Samuel Adeyemi',
    title: 'Archdeacon',
    parish: 'St. Peter\'s Parish',
    archdeaconry: 'Gbongan Archdeaconry', // TODO: confirm real archdeacon-to-archdeaconry mapping with the diocesan office
    photo: '/images/bishop.png',
    email: 'samuel.adeyemi@okeosundiocese.org',
  },
  {
    id: 'clg-002',
    name: 'Rev. Canon Elizabeth Fadipe',
    title: 'Canon',
    parish: 'All Saints Parish',
    archdeaconry: 'Odeomu Archdeaconry', // TODO: confirm real archdeacon-to-archdeaconry mapping with the diocesan office
  },
  {
    id: 'clg-003',
    name: 'Rev. David Ogunleye',
    title: 'Vicar',
    parish: 'St. Andrew\'s Parish',
    archdeaconry: 'Ikire Archdeaconry', // TODO: confirm real archdeacon-to-archdeaconry mapping with the diocesan office
  },
];
