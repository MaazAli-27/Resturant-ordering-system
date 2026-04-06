import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Menu
export const getMenuItems = (category) =>
  API.get('/menu', { params: category ? { category } : {} });

// Orders
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getOrderById = (id) => API.get(`/orders/${id}`);

// Payment
export const createCheckoutSession = (orderId) =>
  API.post('/payment/create-checkout-session', { orderId });
