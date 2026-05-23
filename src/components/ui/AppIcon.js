import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ICONS = {
  all: 'sparkles-outline',
  alert: 'alert-circle-outline',
  audio: 'mic-outline',
  back: 'chevron-back',
  bible: 'book-outline',
  calendar: 'calendar-outline',
  check: 'checkmark',
  church: 'business-outline',
  close: 'close',
  document: 'document-text-outline',
  download: 'download-outline',
  edit: 'create-outline',
  email: 'mail-outline',
  eye: 'eye-outline',
  eyeOff: 'eye-off-outline',
  heart: 'heart-outline',
  home: 'home-outline',
  live: 'tv-outline',
  location: 'location-outline',
  lock: 'lock-closed-outline',
  logout: 'log-out-outline',
  magazine: 'newspaper-outline',
  menu: 'apps-outline',
  notification: 'notifications-outline',
  pause: 'pause',
  person: 'person-outline',
  phone: 'call-outline',
  play: 'play',
  privacy: 'shield-checkmark-outline',
  resources: 'library-outline',
  search: 'search-outline',
  send: 'megaphone-outline',
  settings: 'settings-outline',
  share: 'share-social-outline',
  star: 'star-outline',
  time: 'time-outline',
  upload: 'camera-outline',
  video: 'videocam-outline',
};

export default function AppIcon({ name, size = 20, color = COLORS.textMuted, style, accessibilityLabel }) {
  return (
    <Ionicons
      name={ICONS[name] || name || 'ellipse-outline'}
      size={size}
      color={color}
      style={style}
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'auto' : 'no-hide-descendants'}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
