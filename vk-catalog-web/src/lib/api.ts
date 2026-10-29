import type { PriceMap } from './pricing';

const TOKEN_KEY = 'vk-admin-token';

export const adminToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setAdminToken = (token: string | null): void => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const token = adminToken();
  if (token) headers['x-admin-token'] = token;

  const res = await fetch(path, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

export interface PricesResponse {
  prices: PriceMap;
}

export const getPrices = (): Promise<PricesResponse> => request('/api/prices');

export interface AdminStatus {
  authRequired: boolean;
}

export const getAdminStatus = (): Promise<AdminStatus> => request('/api/admin/status');

export interface LoginResponse {
  ok: boolean;
  token?: string;
}

export const adminLogin = async (password: string): Promise<LoginResponse> => {
  const res = await request<LoginResponse>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  if (res.token) setAdminToken(res.token);
  return res;
};

export interface SaveResponse {
  ok: boolean;
}

export const savePrice = (
  id: string,
  value: number,
  unit: string,
): Promise<SaveResponse> =>
  request('/api/prices', { method: 'PUT', body: JSON.stringify({ id, value, unit }) });

export const deletePrice = (id: string): Promise<SaveResponse> =>
  request(`/api/prices/${encodeURIComponent(id)}`, { method: 'DELETE' });