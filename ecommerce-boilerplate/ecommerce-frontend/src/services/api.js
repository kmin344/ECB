import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Response error:', error);
    if (error.response && error.response.status === 401) {
      console.log('Token is invalid or expired');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);

// Related products
export const getRelatedProducts = (productId, category) => {
  return api.get(`${API_URL}/products/related`, {
    params: { productId, category }
  });
};

// Reviews
export const getReviews = (productId) => {
  return api.get(`${API_URL}/reviews/product/${productId}`);
};

export const postReview = (productId, reviewData) => {
  return api.post(`${API_URL}/reviews`, reviewData);
};

// Cart
export const fetchCart = () => api.get('/cart');
export const addToCart = (productId) => api.post('/cart', { productId });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// Profile
export const fetchProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
// export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

export default api;