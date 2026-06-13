import axios from 'axios';
import { API_URL } from '../config';

const API = axios.create({
  baseURL: API_URL,
});

// Add token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - token expired
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Orders
export const getAllOrders = (status) =>
  API.get('/orders', { params: status ? { status } : {} });
export const updateOrderStatus = (id, status) =>
  API.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => API.delete(`/orders/${id}`);

// Menu
export const getAllMenuItems = () => API.get('/menu');
export const createMenuItem = (data) => API.post('/menu', data);
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);
