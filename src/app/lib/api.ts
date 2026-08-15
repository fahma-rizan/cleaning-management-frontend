const BASE_URL = 'http://localhost:5000/api';

// Temporary mock token until auth finishes
const MOCK_HEADERS = {
  'Content-Type': 'application/json',
};

// Utility to convert backend photo paths to full URLs
export const getPhotoUrl = (photoUrl: string) => {
  if (!photoUrl) return '';
  return `http://localhost:5000${photoUrl}`;
};

// ─── ADMINS ───────────────────────────────────────────────────────────────────

export const adminAPI = {

  getAll: async () => {
    const res = await fetch(`${BASE_URL}/admins`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admins/${id}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  create: async (data: {
    name: string; email: string; password: string;
    phone?: string; address?: string; role: string;
  }) => {
    const res = await fetch(`${BASE_URL}/admins`, {
      method:  'POST',
      headers: MOCK_HEADERS,
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  update: async (id: string, data: {
    role?: string; status?: string;
    name?: string; phone?: string; address?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/admins/${id}`, {
      method:  'PUT',
      headers: MOCK_HEADERS,
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  deactivate: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admins/${id}/deactivate`, {
      method:  'PUT',
      headers: MOCK_HEADERS,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  activate: async (id: string) => {
    // Prefer dedicated activate endpoint; fallback to generic update if unavailable.
    let res = await fetch(`${BASE_URL}/admins/${id}/activate`, {
      method:  'PUT',
      headers: MOCK_HEADERS,
    });

    if (res.status === 404) {
      res = await fetch(`${BASE_URL}/admins/${id}`, {
        method:  'PUT',
        headers: MOCK_HEADERS,
        body:    JSON.stringify({ status: 'Active' }),
      });
    }

    if (!res.ok) {
      const text = await res.text();
      try {
        throw JSON.parse(text);
      } catch {
        throw { error: text || 'Failed to activate admin' };
      }
    }
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admins/${id}`, {
      method:  'DELETE',
      headers: MOCK_HEADERS,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

// ─── STAFF ────────────────────────────────────────────────────────────────────

export const staffAPI = {

  getAll: async (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    const res = await fetch(`${BASE_URL}/staff?${params}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/staff/${id}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getAvailable: async () => {
    const res = await fetch(`${BASE_URL}/staff/available`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  create: async (formData: FormData) => {
    const res = await fetch(`${BASE_URL}/staff`, {
      method: 'POST',
      body:   formData, // no Content-Type header — browser sets it with boundary
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  update: async (id: string, formData: FormData) => {
    const res = await fetch(`${BASE_URL}/staff/${id}`, {
      method: 'PUT',
      body:   formData,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  deactivate: async (id: string) => {
    const res = await fetch(`${BASE_URL}/staff/${id}/deactivate`, {
      method:  'PUT',
      headers: MOCK_HEADERS,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  activate: async (id: string) => {
    const res = await fetch(`${BASE_URL}/staff/${id}/activate`, {
      method:  'PUT',
      headers: MOCK_HEADERS,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${BASE_URL}/staff/${id}`, {
      method:  'DELETE',
      headers: MOCK_HEADERS,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────

export const customerAPI = {

  getAll: async (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const res = await fetch(`${BASE_URL}/customers?${params}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/customers/${id}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  updateStatus: async (id: string, status: 'active' | 'inactive' | 'blocked') => {
    const res = await fetch(`${BASE_URL}/customers/${id}/status`, {
      method:  'PUT',
      headers: MOCK_HEADERS,
      body:    JSON.stringify({ status }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

export const reviewAPI = {

  getAll: async (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${BASE_URL}/reviews?${params}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getStats: async () => {
    const res = await fetch(`${BASE_URL}/reviews/stats`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  approve: async (id: string) => {
    const res = await fetch(`${BASE_URL}/reviews/${id}/approve`, {
      method: 'PUT', headers: MOCK_HEADERS,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  hide: async (id: string) => {
    const res = await fetch(`${BASE_URL}/reviews/${id}/hide`, {
      method: 'PUT', headers: MOCK_HEADERS,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: 'DELETE', headers: MOCK_HEADERS,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

// ─── COMPLAINTS ───────────────────────────────────────────────────────────────

export const complaintAPI = {

  getAll: async (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${BASE_URL}/complaints?${params}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/complaints/${id}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${BASE_URL}/complaints/${id}/status`, {
      method: 'PUT', headers: MOCK_HEADERS,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  updatePriority: async (id: string, priority: string) => {
    const res = await fetch(`${BASE_URL}/complaints/${id}/priority`, {
      method: 'PUT', headers: MOCK_HEADERS,
      body: JSON.stringify({ priority }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  assign: async (id: string, staffId: string) => {
    const res = await fetch(`${BASE_URL}/complaints/${id}/assign`, {
      method: 'PUT', headers: MOCK_HEADERS,
      body: JSON.stringify({ staffId }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  addNote: async (id: string, note: string) => {
    const res = await fetch(`${BASE_URL}/complaints/${id}/notes`, {
      method: 'POST', headers: MOCK_HEADERS,
      body: JSON.stringify({ note }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

export const overviewAPI = {
  getStats:           () => fetch(`${BASE_URL}/overview/stats`,             { headers: MOCK_HEADERS }).then(r => r.json()),
  getRevenueChart:    () => fetch(`${BASE_URL}/overview/revenue-chart`,     { headers: MOCK_HEADERS }).then(r => r.json()),
  getServiceBreakdown:() => fetch(`${BASE_URL}/overview/service-breakdown`, { headers: MOCK_HEADERS }).then(r => r.json()),
  getRecentBookings:  () => fetch(`${BASE_URL}/overview/recent-bookings`,   { headers: MOCK_HEADERS }).then(r => r.json()),
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────

export const reportAPI = {

  getBookings: async (filters: { from?: string; to?: string; service?: string; status?: string }) => {
    const params = new URLSearchParams(filters as any);
    const res = await fetch(`${BASE_URL}/reports/bookings?${params}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getPayments: async (filters: { period?: string; method?: string }) => {
    const params = new URLSearchParams(filters as any);
    const res = await fetch(`${BASE_URL}/reports/payments?${params}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getStaffPerformance: async (filters: { period?: string; staff?: string }) => {
    const params = new URLSearchParams(filters as any);
    const res = await fetch(`${BASE_URL}/reports/staff-performance?${params}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getCustomers: async (filters: { period?: string; status?: string }) => {
    const params = new URLSearchParams(filters as any);
    const res = await fetch(`${BASE_URL}/reports/customers?${params}`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export const settingsAPI = {

  get: async () => {
    const res = await fetch(`${BASE_URL}/settings`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  saveGeneral: async (data: any) => {
    const res = await fetch(`${BASE_URL}/settings/general`, {
      method: 'PUT', headers: MOCK_HEADERS, body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  saveBusiness: async (data: any) => {
    const res = await fetch(`${BASE_URL}/settings/business`, {
      method: 'PUT', headers: MOCK_HEADERS, body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  savePricing: async (serviceId: number, pricing: any) => {
    const res = await fetch(`${BASE_URL}/settings/pricing/${serviceId}`, {
      method: 'PUT', headers: MOCK_HEADERS, body: JSON.stringify({ pricing }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

// ─── GPS ──────────────────────────────────────────────────────────────────────

export const gpsAPI = {
  getActiveCleaners: async () => {
    const res = await fetch(`${BASE_URL}/gps/active-cleaners`, { headers: MOCK_HEADERS });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  updateStatus: async (staffId: string, data: {
    status: string; latitude: number; longitude: number;
    eta?: string; customerName?: string; currentJob?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/gps/cleaners/${staffId}/status`, {
      method:  'PUT',
      headers: MOCK_HEADERS,
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
