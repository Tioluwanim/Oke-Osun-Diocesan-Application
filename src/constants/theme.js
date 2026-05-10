export const COLORS = {
  // Backgrounds
  background: '#0A0C10',
  surface: '#111318',
  surface2: '#1B2030',
  surfaceElevated: '#181D2A',

  // Brand
  gold: '#C9A84C',
  goldLight: '#E8C97A',
  goldDim: '#8A6D2E',
  softGold: 'rgba(201, 168, 76, 0.16)',

  // Text
  text: '#E8E4D8',
  textMuted: '#7A7568',
  textLight: '#9E9A8E',

  // Accents
  teal: '#4CC9A8',
  red: '#C94C4C',
  blue: '#4C8AC9',
  purple: '#8A4CC9',       // ← added
  orange: '#C9784C',       // ← added (useful later)

  // UI
  border: 'rgba(201, 168, 76, 0.18)',
  borderFocus: 'rgba(201, 168, 76, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Status
  success: '#4CC9A8',
  error: '#C94C4C',
  warning: '#C9A84C',

  // Role colors (quick reference)
  roleAdmin: '#C94C4C',
  roleClergy: '#4CC9A8',
  roleMember: '#C9A84C',
};

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  weights: {
    light: '300',
    regular: '400',
    semibold: '600',
    bold: '700',
    black: '900',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,       // ← was already there ✅
  xxl: 32,      // ← added for extra large cards
  full: 999,
};