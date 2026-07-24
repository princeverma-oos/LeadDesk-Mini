import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to automatically attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Admin Auth APIs
export const loginAdmin = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const verifyAdminToken = async () => {
  const response = await API.get('/auth/verify');
  return response.data;
};

// Lead APIs

// Submit a new lead (Public endpoint)
export const submitLead = async (leadData) => {
  const response = await API.post('/leads', leadData);
  return response.data;
};

// Fetch all leads (Protected)
export const fetchLeads = async (params = {}) => {
  const response = await API.get('/leads', { params });
  return response.data;
};

// Update lead status (Protected)
export const updateLeadStatus = async (id, status) => {
  const response = await API.patch(`/leads/${id}`, { status });
  return response.data;
};

// Delete a lead (Protected)
export const deleteLead = async (id) => {
  const response = await API.delete(`/leads/${id}`);
  return response.data;
};

// Search leads dynamically (Protected)
export const searchLeads = async (query, params = {}) => {
  const response = await API.get('/leads/search', {
    params: { q: query, ...params }
  });
  return response.data;
};

// Fetch demo status from backend
export const fetchStatus = async () => {
  const response = await API.get('/status');
  return response.data;
};

export default API;
