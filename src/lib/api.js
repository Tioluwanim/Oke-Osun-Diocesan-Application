import { API_ROUTES } from '../constants/config';

let authHandlers = {
  getAccessToken: null,
  getRefreshToken: null,
  updateTokens: null,
  onLogout: null,
};
let refreshPromise = null;

export const registerAuthHandlers = ({ getAccessToken, getRefreshToken, updateTokens, onLogout }) => {
  authHandlers = {
    getAccessToken,
    getRefreshToken,
    updateTokens,
    onLogout,
  };
};

const DEFAULT_TIMEOUT_MS = 60000; // 60s — handles Render.com cold start (up to 50s)

async function requestJson(url, options = {}) {
  const { auth, retry, timeoutMs, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(url, { ...fetchOptions, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw new Error('Network request failed. Check your connection.');
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshSession() {
  const refreshToken = authHandlers.getRefreshToken && await authHandlers.getRefreshToken();
  if (!refreshToken) {
    throw new Error('Session expired');
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await requestJson(API_ROUTES.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (authHandlers.onLogout) {
          await authHandlers.onLogout();
        }
        throw new Error(data?.detail || 'Unauthorized');
      }
      if (authHandlers.updateTokens) {
        await authHandlers.updateTokens(data.accessToken || data.token, data.refreshToken);
      }
      return data;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function fetchJson(url, options) {
  const response = await requestJson(url, options);
  const data = await response.json().catch(() => ({}));

  if (response.ok) {
    return data;
  }

  if (response.status === 401 && options?.auth === true && !options?.retry && authHandlers.getRefreshToken && authHandlers.updateTokens) {
    try {
      const refreshed = await refreshSession();
      const newAccessToken = refreshed?.accessToken || refreshed?.token || await authHandlers.getAccessToken?.();
      if (newAccessToken) {
        const headers = { ...(options?.headers || {}), Authorization: `Bearer ${newAccessToken}` };
        return fetchJson(url, { ...options, headers, retry: true });
      }
    } catch (error) {
      throw error;
    }
  }

  throw new Error(data?.detail || response.statusText || 'Request failed');
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
  refresh: async (refreshToken) => fetchJson(API_ROUTES.refresh, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  }),
  logout: async (refreshToken) => fetchJson(API_ROUTES.logout, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  }),
  completeInvite: async (payload) => fetchJson(API_ROUTES.completeInvite, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }),
  approvalStatus: async (email) => fetchJson(API_ROUTES.approvalStatus, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  }),
  updateProfile: async (payload, token) => fetchJson(API_ROUTES.updateProfile, {
    method: 'PATCH',
    headers: authHeaders(token),
    auth: true,
    body: JSON.stringify(payload),
  }),
  changePassword: async (payload, token) => fetchJson(API_ROUTES.changePassword, {
    method: 'PATCH',
    headers: authHeaders(token),
    auth: true,
    body: JSON.stringify(payload),
  }),
};

export const userApi = {
  fetchMe: async (token) => fetchJson(API_ROUTES.currentUser, { headers: authHeaders(token), auth: true }),
  fetchParishes: async () => queryFns.parishes(),
  fetchMyParish: async (token) => fetchJson(API_ROUTES.myParish, { headers: authHeaders(token), auth: true }),
  fetchMyParishMembers: async (token) => fetchJson(API_ROUTES.myParishMembers, { headers: authHeaders(token), auth: true }),
  fetchMyParishNotices: async (token) => fetchJson(API_ROUTES.myParishNotices, { headers: authHeaders(token), auth: true }),
  createMyParishNotice: async (payload, token) => fetchJson(API_ROUTES.myParishNotices, {
    method: 'POST',
    headers: authHeaders(token),
    auth: true,
    body: JSON.stringify(payload),
  }),
};

export const adminApi = {
  fetchUsers: async (token, query = '') => fetchJson(`${API_ROUTES.adminUsers}${query}`, { headers: authHeaders(token), auth: true }),
  inviteUser: async (payload, token) => fetchJson(API_ROUTES.adminUserInvite, {
    method: 'POST',
    headers: authHeaders(token),
    auth: true,
    body: JSON.stringify(payload),
  }),
  approveUser: async (userId, token) => fetchJson(API_ROUTES.adminUserApprove(userId), { method: 'PATCH', headers: authHeaders(token), auth: true }),
  suspendUser: async (userId, token) => fetchJson(API_ROUTES.adminUserSuspend(userId), { method: 'PATCH', headers: authHeaders(token), auth: true }),
  changeUserRole: async (userId, role, token) => fetchJson(API_ROUTES.adminUserRole(userId), { method: 'PATCH', headers: authHeaders(token), auth: true, body: JSON.stringify({ role }) }),
  deleteUser: async (userId, token) => fetchJson(API_ROUTES.adminUserById(userId), { method: 'DELETE', headers: authHeaders(token), auth: true }),
  fetchAuditLogs: async (token, query = '') => fetchJson(`${API_ROUTES.auditLogs}${query}`, { headers: authHeaders(token), auth: true }),
};

export const parishApi = {
  createParish: async (payload, token) => fetchJson(API_ROUTES.parishes, { method: 'POST', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  updateParish: async (id, payload, token) => fetchJson(API_ROUTES.parishById(id), { method: 'PATCH', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  deleteParish: async (id, token) => fetchJson(API_ROUTES.parishById(id), { method: 'DELETE', headers: authHeaders(token), auth: true }),
};

export const sermonApi = {
  fetchSermons: async (query = '') => fetchJson(`${API_ROUTES.sermons}${query}`),
  fetchSermon: async (id) => fetchJson(API_ROUTES.sermonById(id)),
  createSermon: async (payload, token) => fetchJson(API_ROUTES.sermons, { method: 'POST', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  updateSermon: async (id, payload, token) => fetchJson(API_ROUTES.sermonById(id), { method: 'PATCH', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  deleteSermon: async (id, token) => fetchJson(API_ROUTES.sermonById(id), { method: 'DELETE', headers: authHeaders(token), auth: true }),
};

export const eventApi = {
  fetchEvents: async (page = 1, query = '') => {
    const separator = query && query.startsWith('?') ? '&' : query ? '?' : '';
    return fetchJson(`${API_ROUTES.events}?page=${page}${separator}${query}`);
  },
  fetchEvent: async (id) => fetchJson(API_ROUTES.eventById(id)),
  createEvent: async (payload, token) => fetchJson(API_ROUTES.events, { method: 'POST', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  updateEvent: async (id, payload, token) => fetchJson(API_ROUTES.eventById(id), { method: 'PATCH', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  deleteEvent: async (id, token) => fetchJson(API_ROUTES.eventById(id), { method: 'DELETE', headers: authHeaders(token), auth: true }),
};

export const liveApi = {
  fetchLive: async () => fetchJson(API_ROUTES.live),
  updateLive: async (payload, token) => fetchJson(API_ROUTES.live, { method: 'PATCH', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  toggleLive: async (token) => fetchJson(API_ROUTES.liveToggle, { method: 'PATCH', headers: authHeaders(token), auth: true }),
};

export const magazineApi = {
  fetchMagazines: async (query = '') => fetchJson(`${API_ROUTES.magazines}${query}`),
  createMagazine: async (payload, token) => fetchJson(API_ROUTES.magazines, { method: 'POST', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  updateMagazine: async (id, payload, token) => fetchJson(API_ROUTES.magazineById(id), { method: 'PATCH', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  deleteMagazine: async (id, token) => fetchJson(API_ROUTES.magazineById(id), { method: 'DELETE', headers: authHeaders(token), auth: true }),
};

export const bibleStudyApi = {
  fetchBibleStudies: async (query = '') => fetchJson(`${API_ROUTES.bibleStudies}${query}`),
  fetchBibleStudy: async (id) => fetchJson(API_ROUTES.bibleStudyById(id)),
  createBibleStudy: async (payload, token) => fetchJson(API_ROUTES.bibleStudies, { method: 'POST', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  updateBibleStudy: async (id, payload, token) => fetchJson(API_ROUTES.bibleStudyById(id), { method: 'PATCH', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  deleteBibleStudy: async (id, token) => fetchJson(API_ROUTES.bibleStudyById(id), { method: 'DELETE', headers: authHeaders(token), auth: true }),
};

export const documentApi = {
  fetchDocuments: async (query = '') => fetchJson(`${API_ROUTES.documents}${query}`),
  fetchDocument: async (id) => fetchJson(API_ROUTES.documentById(id)),
  createDocument: async (payload, token) => fetchJson(API_ROUTES.documents, { method: 'POST', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  updateDocument: async (id, payload, token) => fetchJson(API_ROUTES.documentById(id), { method: 'PATCH', headers: authHeaders(token), auth: true, body: JSON.stringify(payload) }),
  deleteDocument: async (id, token) => fetchJson(API_ROUTES.documentById(id), { method: 'DELETE', headers: authHeaders(token), auth: true }),
};