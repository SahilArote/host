const API_BASE = '/api';

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('spk_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('spk_token');
    localStorage.removeItem('spk_user');
    window.location.reload();
    return null;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
