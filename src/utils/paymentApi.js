// ─── All payment API calls in one place ──────────────────────────────────────
import { API_ROUTES } from '../constants/config';

const json = (res) => {
  if (!res.ok) return res.json().then(d => Promise.reject(new Error(d.detail || 'Request failed')));
  return res.json();
};

export const paymentApi = {
  initiate: (body, token) =>
    fetch(API_ROUTES.paymentsInitiate, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }).then(json),

  verify: (reference, token) =>
    fetch(API_ROUTES.paymentsVerify(reference), {
      headers: { Authorization: `Bearer ${token}` },
    }).then(json),

  myHistory: (token, page = 1, limit = 30) =>
    fetch(`${API_ROUTES.paymentsMyHistory}?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(json),

  adminAll: (token, params = {}) => {
    const q = new URLSearchParams({ limit: '50', page: '1', ...params });
    return fetch(`${API_ROUTES.paymentsAdminAll}?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(json);
  },

  submitProof: (reference, proofUrl, token) =>
    fetch(`${API_ROUTES.paymentsInitiate.replace('/initiate', '')}/${reference}/proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ proofUrl }),
    }).then(json),
};