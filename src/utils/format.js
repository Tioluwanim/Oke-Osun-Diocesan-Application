// ─── Formatting utilities ─────────────────────────────────────────────────────
// Centralised so any screen can import without reimplementing

export const formatNaira = (val) => {
  if (val === null || val === undefined) return '₦—';
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return '₦0';
  if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `₦${(num / 1_000).toFixed(1)}K`;
  return `₦${num.toLocaleString('en-NG')}`;
};

export const formatDate = (value, opts = {}) => {
  if (!value) return 'TBA';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric', ...opts,
    });
  } catch { return String(value); }
};

export const formatDateTime = (value) =>
  formatDate(value, { hour: '2-digit', minute: '2-digit' });

export const formatRelative = (value) => {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return 'Just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return formatDate(value);
};

export const isFutureDate = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime()) && d >= new Date(new Date().setHours(0,0,0,0));
};

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const truncate = (str = '', len = 80) =>
  str.length <= len ? str : str.slice(0, len).trimEnd() + '…';