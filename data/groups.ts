import { Group } from '@/types';

export const groups: Group[] = [
  { id: 'grp-001', name: 'Women\'s Organization', slug: 'womens-organization', description: 'Umbrella body for all women\'s ministries in the Diocese.' },
  { id: 'grp-002', name: 'Women\'s Guild', slug: 'womens-guild', parentSlug: 'womens-organization', description: 'Fellowship and service ministry for adult women.' },
  { id: 'grp-003', name: 'Mothers\' Union', slug: 'mothers-union', parentSlug: 'womens-organization', description: 'Supporting marriage, family life, and Christian parenting.' },
  { id: 'grp-004', name: 'Clergy Wives', slug: 'clergy-wives', parentSlug: 'womens-organization', description: 'Fellowship and support for wives of clergy.' },
  { id: 'grp-005', name: 'Girls & Ladies Guild', slug: 'girls-and-ladies-guild', parentSlug: 'womens-organization', description: 'Discipleship for young women and girls.' },
  { id: 'grp-006', name: 'Boys & Samuel Mission', slug: 'boys-samuel-mission', parentSlug: 'womens-organization', description: 'Christian formation ministry for boys.' },
  { id: 'grp-007', name: 'Anglican Youth Fellowship (AYF)', slug: 'ayf', description: 'The Diocese\'s youth fellowship, uniting young people in worship and service.' },
];
