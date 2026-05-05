import axios from 'axios';

export const apiBase =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (typeof window !== 'undefined' && err?.response?.status === 401) {
      const here = window.location.pathname;
      if (here.startsWith('/admin') && here !== '/login') {
        const next = encodeURIComponent(here);
        window.location.href = `/login?next=${next}`;
      }
    }
    return Promise.reject(err);
  },
);
