import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const fetchProducts = () => api.get('/products');
export const fetchCart = () => api.get('/cart');
export const addToCart = (productId) => api.post('/cart', { productId });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);
export const fetchProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

export default api;