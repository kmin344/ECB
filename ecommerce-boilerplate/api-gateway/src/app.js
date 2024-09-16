// api-gateway/src/app.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the E-commerce API Gateway');
});

// Proxy middleware configuration
const createProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
});

// Product Service
app.use('/api/products', createProxy('http://product-service:3000'));

// Order Service
app.use('/api/orders', createProxy('http://order-service:3000'));

// Auth Service
app.use('/api/auth', createProxy('http://auth-service:3000'));

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

const reviewServiceProxy = createProxyMiddleware({
  target: 'http://review-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/reviews': '/api/reviews',
  },
});

app.use('/api/reviews', reviewServiceProxy);