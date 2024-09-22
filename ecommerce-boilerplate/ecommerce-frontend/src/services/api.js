import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Token is invalid or expired
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

// Auth
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getProducts = () => api.get('/products');
export const fetchCart = () => api.get('/cart');
export const addToCart = (productId) => api.post('/cart', { productId });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);
export const fetchProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
// export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

export default api;