const express = require('express');
const router = express.Router();

// Proxy middleware configuration
const createProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
});

// Root route
app.get('/', (req, res) => {
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