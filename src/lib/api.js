import { API_ROUTES } from '../constants/config';

export async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || 'Request failed');
  }

  return data;
}

export const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const queryKeys = {
  live: ['live'],
  events: ['events'],
  sermons: ['sermons'],
  magazines: ['magazines'],
  bibleStudies: ['bible-studies'],
  documents: ['documents'],
  parishes: ['parishes'],
  adminUsers: ['admin-users'],
  myParish: ['my-parish'],
  myParishMembers: ['my-parish-members'],
  myParishNotices: ['my-parish-notices'],
  auditLogs: ['audit-logs'],
};

export const queryFns = {
  live: async () => {
    const data = await fetchJson(API_ROUTES.live);
    return data.stream || null;
  },
  events: async () => {
    const data = await fetchJson(`${API_ROUTES.events}?limit=100`);
    return data.events || [];
  },
  sermons: async () => {
    const data = await fetchJson(`${API_ROUTES.sermons}?limit=100`);
    return data.sermons || [];
  },
  magazines: async () => {
    const data = await fetchJson(`${API_ROUTES.magazines}?limit=100`);
    return data.magazines || [];
  },
  bibleStudies: async () => {
    const data = await fetchJson(`${API_ROUTES.bibleStudies}?limit=100`);
    return data.bible_studies || [];
  },
  documents: async () => {
    const data = await fetchJson(`${API_ROUTES.documents}?limit=100`);
    return data.documents || [];
  },
  parishes: async () => {
    const data = await fetchJson(API_ROUTES.parishes);
    return data.parishes || [];
  },
};

export const authApi = {
  register: async (payload) => fetchJson(API_ROUTES.register, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }),
  login: async (payload) => fetchJson(API_ROUTES.login, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }),
  completeInvite: async (payload) => fetchJson(API_ROUTES.completeInvite, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }),
  updateProfile: async (payload, token) => fetchJson(API_ROUTES.updateProfile, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  }),
  changePassword: async (payload, token) => fetchJson(API_ROUTES.changePassword, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  }),
};

export const userApi = {
  fetchParishes: async () => queryFns.parishes(),
  fetchMyParish: async (token) => fetchJson(API_ROUTES.myParish, { headers: authHeaders(token) }),
  fetchMyParishMembers: async (token) => fetchJson(API_ROUTES.myParishMembers, { headers: authHeaders(token) }),
  fetchMyParishNotices: async (token) => fetchJson(API_ROUTES.myParishNotices, { headers: authHeaders(token) }),
  createMyParishNotice: async (payload, token) => fetchJson(API_ROUTES.myParishNotices, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  }),
};

export const adminApi = {
  fetchUsers: async (token, query = '') => fetchJson(`${API_ROUTES.adminUsers}${query}`, { headers: authHeaders(token) }),
  inviteUser: async (payload, token) => fetchJson(API_ROUTES.adminUserInvite, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  }),
  approveUser: async (userId, token) => fetchJson(API_ROUTES.adminUserApprove(userId), { method: 'PATCH', headers: authHeaders(token) }),
  suspendUser: async (userId, token) => fetchJson(API_ROUTES.adminUserSuspend(userId), { method: 'PATCH', headers: authHeaders(token) }),
  changeUserRole: async (userId, role, token) => fetchJson(API_ROUTES.adminUserRole(userId), { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ role }) }),
  deleteUser: async (userId, token) => fetchJson(API_ROUTES.adminUserById(userId), { method: 'DELETE', headers: authHeaders(token) }),
  fetchAuditLogs: async (token, query = '') => fetchJson(`${API_ROUTES.auditLogs}${query}`, { headers: authHeaders(token) }),
};

export const parishApi = {
  createParish: async (payload, token) => fetchJson(API_ROUTES.parishes, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }),
  updateParish: async (id, payload, token) => fetchJson(API_ROUTES.parishById(id), { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) }),
  deleteParish: async (id, token) => fetchJson(API_ROUTES.parishById(id), { method: 'DELETE', headers: authHeaders(token) }),
};

export const sermonApi = {
  fetchSermons: async (query = '') => fetchJson(`${API_ROUTES.sermons}${query}`),
  fetchSermon: async (id) => fetchJson(API_ROUTES.sermonById(id)),
  createSermon: async (payload, token) => fetchJson(API_ROUTES.sermons, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }),
  updateSermon: async (id, payload, token) => fetchJson(API_ROUTES.sermonById(id), { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) }),
  deleteSermon: async (id, token) => fetchJson(API_ROUTES.sermonById(id), { method: 'DELETE', headers: authHeaders(token) }),
};

export const eventApi = {
  fetchEvents: async (query = '') => fetchJson(`${API_ROUTES.events}${query}`),
  fetchEvent: async (id) => fetchJson(API_ROUTES.eventById(id)),
  createEvent: async (payload, token) => fetchJson(API_ROUTES.events, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }),
  updateEvent: async (id, payload, token) => fetchJson(API_ROUTES.eventById(id), { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) }),
  deleteEvent: async (id, token) => fetchJson(API_ROUTES.eventById(id), { method: 'DELETE', headers: authHeaders(token) }),
};

export const liveApi = {
  fetchLive: async () => fetchJson(API_ROUTES.live),
  updateLive: async (payload, token) => fetchJson(API_ROUTES.live, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) }),
  toggleLive: async (token) => fetchJson(API_ROUTES.liveToggle, { method: 'PATCH', headers: authHeaders(token) }),
};

export const magazineApi = {
  fetchMagazines: async (query = '') => fetchJson(`${API_ROUTES.magazines}${query}`),
  createMagazine: async (payload, token) => fetchJson(API_ROUTES.magazines, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }),
  updateMagazine: async (id, payload, token) => fetchJson(API_ROUTES.magazineById(id), { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) }),
  deleteMagazine: async (id, token) => fetchJson(API_ROUTES.magazineById(id), { method: 'DELETE', headers: authHeaders(token) }),
};

export const bibleStudyApi = {
  fetchBibleStudies: async (query = '') => fetchJson(`${API_ROUTES.bibleStudies}${query}`),
  fetchBibleStudy: async (id) => fetchJson(API_ROUTES.bibleStudyById(id)),
  createBibleStudy: async (payload, token) => fetchJson(API_ROUTES.bibleStudies, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }),
  updateBibleStudy: async (id, payload, token) => fetchJson(API_ROUTES.bibleStudyById(id), { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) }),
  deleteBibleStudy: async (id, token) => fetchJson(API_ROUTES.bibleStudyById(id), { method: 'DELETE', headers: authHeaders(token) }),
};

export const documentApi = {
  fetchDocuments: async (query = '') => fetchJson(`${API_ROUTES.documents}${query}`),
  fetchDocument: async (id) => fetchJson(API_ROUTES.documentById(id)),
  createDocument: async (payload, token) => fetchJson(API_ROUTES.documents, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }),
  updateDocument: async (id, payload, token) => fetchJson(API_ROUTES.documentById(id), { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) }),
  deleteDocument: async (id, token) => fetchJson(API_ROUTES.documentById(id), { method: 'DELETE', headers: authHeaders(token) }),
};
