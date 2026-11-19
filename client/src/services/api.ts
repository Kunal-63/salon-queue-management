const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

export const API_BASE = `${SERVER_URL}/api`;

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export interface ServiceItem {
  id: number;
  name_en: string;
  name_gu: string;
  duration: number;
  price: number;
  is_active: number;
}

export interface BarberItem {
  id: number;
  name: string;
  is_on_duty: number;
  status: 'free' | 'busy' | 'break' | 'calling' | string;
  current_ticket_id: number | null;
  service_started_at: string | null;
  current_customer_name?: string;
  current_token?: string;
}

export interface QueueTicket {
  id: number;
  token: string;
  customer_name: string;
  phone: string;
  preferred_barber: string;
  assigned_barber: string | null;
  services: string; // JSON string array
  total_duration: number;
  total_price: number;
  status: 'waiting' | 'called' | 'in_chair' | 'done' | 'cancelled' | 'noshow';
  is_walkin: number;
  created_at: string;
  called_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  position?: number;
  estimated_wait?: number;
}

export interface QueueStats {
  waitingCount: number;
  servedCount: number;
  noShowsCount: number;
  approxWait: number;
  totalRevenue: number;
}

// Fallback demo dataset in case API is disconnected or during development preview
export const FALLBACK_SERVICES: ServiceItem[] = [
  { id: 1, name_en: 'Haircut', name_gu: 'હેરકટ', duration: 30, price: 150, is_active: 1 },
  { id: 2, name_en: 'Beard trim', name_gu: 'દાઢી ટ્રીમ', duration: 15, price: 80, is_active: 1 },
  { id: 3, name_en: 'Hair spa', name_gu: 'હેર સ્પા', duration: 45, price: 400, is_active: 1 },
  { id: 4, name_en: 'Hair color', name_gu: 'હેર કલર', duration: 60, price: 600, is_active: 1 },
  { id: 5, name_en: 'Shave', name_gu: 'શેવિંગ', duration: 20, price: 100, is_active: 1 },
];

export const FALLBACK_BARBERS: BarberItem[] = [
  { id: 1, name: 'Ravi', is_on_duty: 1, status: 'busy', current_ticket_id: 1, service_started_at: new Date(Date.now() - 15 * 60000).toISOString(), current_customer_name: 'Arjun Patel', current_token: 'S-12' },
  { id: 2, name: 'Amit', is_on_duty: 1, status: 'free', current_ticket_id: null, service_started_at: null },
  { id: 3, name: 'Imran', is_on_duty: 1, status: 'break', current_ticket_id: null, service_started_at: null },
];

export const FALLBACK_QUEUE: QueueTicket[] = [
  { id: 1, token: 'S-12', customer_name: 'Arjun Patel', phone: '9876543210', preferred_barber: 'Ravi', assigned_barber: 'Ravi', services: JSON.stringify(['Haircut', 'Beard trim']), total_duration: 45, total_price: 230, status: 'in_chair', is_walkin: 0, created_at: new Date(Date.now() - 40 * 60000).toISOString(), called_at: new Date(Date.now() - 20 * 60000).toISOString(), started_at: new Date(Date.now() - 15 * 60000).toISOString(), completed_at: null, position: 0, estimated_wait: 0 },
  { id: 2, token: 'S-13', customer_name: 'Devendra Shah', phone: '9822334455', preferred_barber: 'Any', assigned_barber: null, services: JSON.stringify(['Haircut']), total_duration: 30, total_price: 150, status: 'waiting', is_walkin: 0, created_at: new Date(Date.now() - 35 * 60000).toISOString(), called_at: null, started_at: null, completed_at: null, position: 1, estimated_wait: 15 },
  { id: 3, token: 'S-14', customer_name: 'Kunal Sharma', phone: '9898989898', preferred_barber: 'Amit', assigned_barber: null, services: JSON.stringify(['Haircut', 'Hair spa']), total_duration: 75, total_price: 550, status: 'waiting', is_walkin: 0, created_at: new Date(Date.now() - 30 * 60000).toISOString(), called_at: null, started_at: null, completed_at: null, position: 2, estimated_wait: 35 },
  { id: 4, token: 'S-15', customer_name: 'Vikram Joshi', phone: '9711223344', preferred_barber: 'Ravi', assigned_barber: null, services: JSON.stringify(['Haircut']), total_duration: 30, total_price: 150, status: 'waiting', is_walkin: 1, created_at: new Date(Date.now() - 25 * 60000).toISOString(), called_at: null, started_at: null, completed_at: null, position: 3, estimated_wait: 45 },
  { id: 5, token: 'S-16', customer_name: 'Rahul Mehta', phone: '9655443322', preferred_barber: 'Any', assigned_barber: null, services: JSON.stringify(['Beard trim', 'Shave']), total_duration: 35, total_price: 180, status: 'waiting', is_walkin: 0, created_at: new Date(Date.now() - 20 * 60000).toISOString(), called_at: null, started_at: null, completed_at: null, position: 4, estimated_wait: 50 },
  { id: 6, token: 'S-17', customer_name: 'Samir Desai', phone: '9544332211', preferred_barber: 'Any', assigned_barber: null, services: JSON.stringify(['Hair color']), total_duration: 60, total_price: 600, status: 'waiting', is_walkin: 0, created_at: new Date(Date.now() - 15 * 60000).toISOString(), called_at: null, started_at: null, completed_at: null, position: 5, estimated_wait: 65 },
  { id: 7, token: 'S-18', customer_name: 'Pooja Trivedi', phone: '9433221100', preferred_barber: 'Amit', assigned_barber: null, services: JSON.stringify(['Haircut', 'Hair spa']), total_duration: 75, total_price: 550, status: 'waiting', is_walkin: 0, created_at: new Date(Date.now() - 10 * 60000).toISOString(), called_at: null, started_at: null, completed_at: null, position: 6, estimated_wait: 80 },
];

export const api = {
  getQueue: async () => {
    try {
      return await fetchApi<{ queue: QueueTicket[]; barbers: BarberItem[]; stats: QueueStats; isOnlineOpen: boolean }>('/queue');
    } catch {
      return {
        queue: FALLBACK_QUEUE,
        barbers: FALLBACK_BARBERS,
        stats: { waitingCount: 6, servedCount: 14, noShowsCount: 1, approxWait: 50, totalRevenue: 3450 },
        isOnlineOpen: true,
      };
    }
  },

  getServices: async () => {
    try {
      const res = await fetchApi<{ services: ServiceItem[] }>('/services');
      return res.services;
    } catch {
      return FALLBACK_SERVICES;
    }
  },

  getBarbers: async () => {
    try {
      const res = await fetchApi<{ barbers: BarberItem[] }>('/barbers');
      return res.barbers;
    } catch {
      return FALLBACK_BARBERS;
    }
  },

  getTicket: async (tokenOrId: string) => {
    try {
      const res = await fetchApi<{ ticket: QueueTicket }>(`/queue/ticket/${tokenOrId}`);
      return res.ticket;
    } catch {
      const match = FALLBACK_QUEUE.find(
        (t) => t.token.toLowerCase() === tokenOrId.toLowerCase() || String(t.id) === tokenOrId
      );
      if (match) return match;
      // Generate synthetic S-14 or requested token if needed for display testing
      return {
        id: 99,
        token: tokenOrId.toUpperCase(),
        customer_name: 'Kunal Sharma',
        phone: '9898989898',
        preferred_barber: 'Amit',
        assigned_barber: null,
        services: JSON.stringify(['Haircut', 'Beard trim']),
        total_duration: 45,
        total_price: 230,
        status: 'waiting' as const,
        is_walkin: 0,
        created_at: new Date(Date.now() - 20 * 60000).toISOString(),
        called_at: null,
        started_at: null,
        completed_at: null,
        position: 4,
        estimated_wait: 35,
      };
    }
  },

  joinQueue: async (data: {
    customer_name: string;
    phone: string;
    preferred_barber?: string;
    service_names?: string[];
    is_walkin?: boolean;
  }) => {
    return await fetchApi<{ ticket: QueueTicket }>('/queue/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  callNext: async (barber: string) => {
    return await fetchApi<{ ticket: QueueTicket }>('/queue/call-next', {
      method: 'POST',
      body: JSON.stringify({ barber }),
    });
  },

  startService: async (token: string) => {
    return await fetchApi<{ ticket: QueueTicket }>(`/queue/${token}/start`, {
      method: 'POST',
    });
  },

  doneService: async (token: string) => {
    return await fetchApi<{ ticket: QueueTicket }>(`/queue/${token}/done`, {
      method: 'POST',
    });
  },

  cancelTicket: async (token: string) => {
    return await fetchApi<{ ticket: QueueTicket }>(`/queue/${token}/cancel`, {
      method: 'POST',
    });
  },

  markNoShow: async (token: string) => {
    return await fetchApi<{ ticket: QueueTicket }>(`/queue/${token}/noshow`, {
      method: 'POST',
    });
  },

  toggleBreak: async (barberName: string) => {
    return await fetchApi<{ barber: BarberItem }>(`/barbers/${barberName}/toggle-break`, {
      method: 'POST',
    });
  },

  toggleDuty: async (barberName: string) => {
    return await fetchApi<{ barber: BarberItem }>(`/barbers/${barberName}/toggle-duty`, {
      method: 'POST',
    });
  },

  updateService: async (id: number, is_active: number, price?: number, duration?: number) => {
    return await fetchApi<{ success: boolean; services: ServiceItem[] }>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active, price, duration }),
    });
  },

  toggleQueueOpen: async (isOpen: boolean) => {
    return await fetchApi<{ isOpen: boolean }>('/settings/queue-open', {
      method: 'POST',
      body: JSON.stringify({ isOpen }),
    });
  },
};
