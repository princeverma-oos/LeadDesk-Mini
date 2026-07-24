import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Submit a new lead (Client-side validation errors are caught before sending; server errors are thrown)
export const submitLead = async (leadData) => {
  const response = await API.post('/leads', leadData);
  return response.data;
};

// Fetch all leads (with sorting, pagination, and status filters)
export const fetchLeads = async (params = {}) => {
  const response = await API.get('/leads', { params });
  return response.data;
};

// Update lead status (instantly updates in DB)
export const updateLeadStatus = async (id, status) => {
  const response = await API.patch(`/leads/${id}`, { status });
  return response.data;
};

// Search leads dynamically with query string
export const searchLeads = async (query, params = {}) => {
  const response = await API.get('/leads/search', {
    params: { q: query, ...params }
  });
  return response.data;
};

export default API;
