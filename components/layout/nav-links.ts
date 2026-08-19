export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Bishop', href: '/about/bishop' },
  { label: 'Archdeaconries', href: '/archdeaconries' },
  { label: 'Ministries', href: '/ministries' },
  {
    label: 'Groups',
    href: '/groups',
    children: [
      { label: 'Women\'s Organization', href: '/groups/womens-organization' },
      { label: 'Anglican Youth Fellowship (AYF)', href: '/groups/ayf' },
    ],
  },
  { label: 'Sermons', href: '/sermons' },
  { label: 'News', href: '/news' },
  { label: 'Events', href: '/events' },
  { label: 'Programs', href: '/programs' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Give', href: '/give' },
  { label: 'Contact', href: '/contact' },
] as const;
