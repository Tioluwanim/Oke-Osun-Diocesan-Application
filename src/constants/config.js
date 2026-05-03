import { Platform } from 'react-native';

const PROD_API_BASE_URL = 'https://oke-osun-diocesan-application.onrender.com';
const LOCAL_API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const ENV_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV?.trim() || (__DEV__ ? 'development' : 'production');
export const API_BASE_URL = ENV_API_BASE_URL || (__DEV__ ? LOCAL_API_BASE_URL : PROD_API_BASE_URL);

export const API_ROUTES = {
  register:      `${API_BASE_URL}/auth/register`,
  login:         `${API_BASE_URL}/auth/login`,
  completeInvite:`${API_BASE_URL}/auth/complete-invite`,
  updateProfile: `${API_BASE_URL}/users/me`,
  changePassword:`${API_BASE_URL}/users/me/password`,
  parishes:      `${API_BASE_URL}/parishes`,
  parishById:    (id) => `${API_BASE_URL}/parishes/${id}`,
  myParish:      `${API_BASE_URL}/parishes/me`,
  myParishMembers:`${API_BASE_URL}/parishes/me/members`,
  myParishNotices:`${API_BASE_URL}/parishes/me/notices`,
  adminUsers:    `${API_BASE_URL}/admin/users`,
  adminUserById: (id) => `${API_BASE_URL}/admin/users/${id}`,
  adminUserInvite:`${API_BASE_URL}/admin/users/invite`,
  adminUserApprove: (id) => `${API_BASE_URL}/admin/users/${id}/approve`,
  adminUserSuspend: (id) => `${API_BASE_URL}/admin/users/${id}/suspend`,
  adminUserRole: (id) => `${API_BASE_URL}/admin/users/${id}/role`,
  sermons:       `${API_BASE_URL}/sermons`,
  sermonById:    (id) => `${API_BASE_URL}/sermons/${id}`,
  events:        `${API_BASE_URL}/events`,
  eventById:     (id) => `${API_BASE_URL}/events/${id}`,
  live:          `${API_BASE_URL}/live`,
  liveToggle:    `${API_BASE_URL}/live/toggle`,
  magazines:     `${API_BASE_URL}/magazines`,
  magazineById:  (id) => `${API_BASE_URL}/magazines/${id}`,
  bibleStudies:  `${API_BASE_URL}/bible-studies`,
  bibleStudyById:(id) => `${API_BASE_URL}/bible-studies/${id}`,
  documents:     `${API_BASE_URL}/documents`,
  documentById:  (id) => `${API_BASE_URL}/documents/${id}`,
  auditLogs:     `${API_BASE_URL}/admin/audit-logs`,
};

export const ROLES = {
  ADMIN:  'admin',
  CLERGY: 'clergy',
  MEMBER: 'member',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'radet_auth_token',
  USER_DATA:  'radet_user_data',
  ROLE:       'radet_user_role',
};
