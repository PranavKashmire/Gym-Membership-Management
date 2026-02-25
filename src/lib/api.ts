import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fitcore_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('fitcore_refresh_token');
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
                    localStorage.setItem('fitcore_token', data.token);
                    localStorage.setItem('fitcore_refresh_token', data.refresh_token);
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return api(originalRequest);
                } catch {
                    localStorage.removeItem('fitcore_token');
                    localStorage.removeItem('fitcore_refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// ─── Typed API helpers ───────────────────────────────────────

// Auth
export const authApi = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
};

// Branches
export const branchApi = {
    getAll: () => api.get('/branches'),
    getById: (id: string) => api.get(`/branches/${id}`),
    create: (data: any) => api.post('/branches', data),
    update: (id: string, data: any) => api.put(`/branches/${id}`, data),
    delete: (id: string) => api.delete(`/branches/${id}`),
};

// Members
export const memberApi = {
    getAll: (params?: Record<string, string>) => api.get('/members', { params }),
    getById: (id: string) => api.get(`/members/${id}`),
    create: (data: any) => api.post('/members', data),
    update: (id: string, data: any) => api.put(`/members/${id}`, data),
    updateStatus: (id: string, status: string) => api.patch(`/members/${id}/status`, { status }),
    getAttendance: (id: string) => api.get(`/members/${id}/attendance`),
};

// Packages
export const packageApi = {
    getAll: () => api.get('/packages'),
    create: (data: any) => api.post('/packages', data),
    update: (id: string, data: any) => api.put(`/packages/${id}`, data),
    toggle: (id: string, is_active: boolean) => api.patch(`/packages/${id}/toggle`, { is_active }),
    delete: (id: string) => api.delete(`/packages/${id}`),
};

// Subscriptions
export const subscriptionApi = {
    getByMember: (member_id: string) => api.get('/subscriptions', { params: { member_id } }),
    create: (data: any) => api.post('/subscriptions', data),
    freeze: (id: string, data: any) => api.patch(`/subscriptions/${id}/freeze`, data),
    unfreeze: (id: string) => api.patch(`/subscriptions/${id}/unfreeze`),
};

// Attendance
export const attendanceApi = {
    getAll: (params?: Record<string, string>) => api.get('/attendance', { params }),
    getToday: (branch_id?: string) => api.get('/attendance/today', { params: { branch_id } }),
    checkIn: (identifier: string, branch_id: string) => api.post('/attendance/checkin', { identifier, branch_id }),
};

// Coaches
export const coachApi = {
    getAll: (params?: Record<string, string>) => api.get('/coaches', { params }),
    getById: (id: string) => api.get(`/coaches/${id}`),
    create: (data: any) => api.post('/coaches', data),
    update: (id: string, data: any) => api.put(`/coaches/${id}`, data),
    getSessions: (coachId: string, status?: string) => api.get(`/coaches/${coachId}/sessions`, { params: { status } }),
    createSession: (data: any) => api.post('/coaches/sessions', data),
    updateSession: (sessionId: string, data: any) => api.patch(`/coaches/sessions/${sessionId}`, data),
};

// Payments
export const paymentApi = {
    getAll: (params?: Record<string, string>) => api.get('/payments', { params }),
    create: (data: any) => api.post('/payments', data),
    updateStatus: (id: string, payment_status: string) => api.patch(`/payments/${id}/status`, { payment_status }),
    getSummary: (params?: Record<string, string>) => api.get('/payments/summary', { params }),
};

// Inquiries
export const inquiryApi = {
    getAll: (params?: Record<string, string>) => api.get('/inquiries', { params }),
    create: (data: any) => api.post('/inquiries', data),
    update: (id: string, data: any) => api.put(`/inquiries/${id}`, data),
    updateStatus: (id: string, data: any) => api.patch(`/inquiries/${id}/status`, data),
    convert: (id: string) => api.post(`/inquiries/${id}/convert`),
};

// Dashboard
export const dashboardApi = {
    getMetrics: (branch_id?: string) => api.get('/dashboard/metrics', { params: { branch_id } }),
    getRevenueChart: (params?: Record<string, string>) => api.get('/dashboard/revenue-chart', { params }),
    getAttendanceChart: (params?: Record<string, string>) => api.get('/dashboard/attendance-chart', { params }),
};

// WhatsApp
export const whatsappApi = {
    getLogs: (params?: Record<string, string>) => api.get('/whatsapp/logs', { params }),
    getTemplates: () => api.get('/whatsapp/templates'),
    createTemplate: (data: any) => api.post('/whatsapp/templates', data),
    send: (data: any) => api.post('/whatsapp/send', data),
};
