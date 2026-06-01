import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
        localStorage.removeItem('pb_token');
        // Optional: redirect to login or handle session expiry
    }
    const msg = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

// ─── Auth (JWT + OTP) ─────────────────────────────────────────────────────────
export const sendOTP = (email) => api.post('/auth/send-otp', { email });
export const verifyOTP = (data) => api.post('/auth/verify-token', data); // Assuming the endpoint was verify-otp or similar in backend
// Correcting backend route reference based on my previous backend code:
export const verifyOTPCode = (data) => api.post('/auth/verify-otp', data);
export const getMyProfile = () => api.get('/auth/me');
export const updateProfile = (data) => api.patch('/auth/profile', data);

// ─── Shipments ────────────────────────────────────────────────────────────────
export const createShipment = (data) => api.post('/shipments', data);
export const getMyShipments = () => api.get('/shipments');
export const getShipment = (id) => api.get(`/shipments/${id}`);
export const updateShipmentStatus = (id, data) => api.patch(`/shipments/${id}/status`, data);

// ─── Couriers ─────────────────────────────────────────────────────────────────
export const compareCouriers = (data) => api.post('/couriers/compare', data);

// ─── Partner ──────────────────────────────────────────────────────────────────
export const getPartnerJobs = () => api.get('/partners/jobs');
export const updateJob = (id, data) => api.patch(`/partners/jobs/${id}`, data);
export const getPartnerEarnings = () => api.get('/partners/earnings');
export const updatePartnerLocation = (data) => api.patch('/partners/location', data);

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminShipments = () => api.get('/admin/shipments');
export const getAdminPartners = () => api.get('/admin/partners');
export const getAdminAnalytics = () => api.get('/admin/analytics');
export const assignPartner = (data) => api.patch('/admin/assign-partner', data);
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });

// ─── Inquiries & Visitor Tracking ──────────────────────────────────────────────
export const submitInquiry = (data) => api.post('/inquiries', data);
export const getAdminInquiries = () => api.get('/inquiries');
export const updateInquiryStatus = (id, status) => api.patch(`/inquiries/${id}`, { status });
export const logVisitorPage = (page) => api.post('/visitor/log', { page });
export const getAdminVisitorLogs = () => api.get('/visitor/logs');

export default api;
