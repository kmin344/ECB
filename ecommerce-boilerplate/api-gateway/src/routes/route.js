const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Proxy middleware configuration
const createProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
});

// Root route
router.get('/', (req, res) => {
  res.send('Welcome to the E-commerce API Gateway');
});

// Product Service
router.use('/api/products', createProxy('http://product-service:3000'));

// Order Service
router.use('/api/orders', createProxy('http://order-service:3000'));

// Auth Service
router.use('/api/auth', createProxy('http://auth-service:3000'));

// User Service
router.use('/api/users', createProxy('http://user-service:3000'));

// Order Service
router.use('/api/orders', createProxy('http://order-service:3000'));

// Review Service
router.use('/api/reviews', createProxy('http://review-service:3000'));

module.exports = router;

const cartServiceProxy = createProxyMiddleware({
  target: 'http://cart-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/carts': '/api/carts',
  },
});

router.use('/api/carts', cartServiceProxy);

const paymentServiceProxy = createProxyMiddleware({
  target: 'http://payment-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/payments': '/api/payments',
  },
});

router.use('/api/payments', paymentServiceProxy);