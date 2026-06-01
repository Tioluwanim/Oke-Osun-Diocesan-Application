import { COLORS } from '../constants/theme';

export const PAYMENT_TYPES = [
  { key: 'tithe',         label: 'Tithe',          icon: '✝️',  color: COLORS.gold,   desc: 'A tenth of your income, given to God' },
  { key: 'offering',      label: 'Offering',        icon: '🙏',  color: COLORS.teal,   desc: 'A freewill gift to the Lord' },
  { key: 'first_fruit',   label: 'First Fruit',     icon: '🌿',  color: '#8A4CC9',     desc: 'The firstfruits of your increase' },
  { key: 'seed',          label: 'Seed',            icon: '🌱',  color: COLORS.teal,   desc: 'Sowing a seed of faith' },
  { key: 'building_fund', label: 'Building Fund',   icon: '⛪',  color: COLORS.blue,   desc: 'Church building & renovation' },
  { key: 'welfare',       label: 'Welfare',         icon: '🤝',  color: COLORS.orange, desc: 'Support for members in need' },
  { key: 'gift',          label: 'Special Gift',    icon: '🎁',  color: COLORS.gold,   desc: 'A special donation' },
  { key: 'other',         label: 'Other',           icon: '💛',  color: COLORS.textMuted, desc: 'Any other contribution' },
];

export const PAYMENT_TYPE_MAP = Object.fromEntries(
  PAYMENT_TYPES.map(t => [t.key, t])
);

export const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000, 50000];
export const MIN_AMOUNT = 50;