const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getToken = (): string | null => localStorage.getItem('token');

const headers = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const request = async (
  method: string,
  endpoint: string,
  body: object | null = null
): Promise<any> => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  get:    (endpoint: string)                => request('GET',    endpoint),
  post:   (endpoint: string, body: object) => request('POST',   endpoint, body),
  put:    (endpoint: string, body: object) => request('PUT',    endpoint, body),
  delete: (endpoint: string)               => request('DELETE', endpoint),
};