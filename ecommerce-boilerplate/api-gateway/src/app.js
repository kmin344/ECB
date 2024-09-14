const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/api/products', createProxyMiddleware({ target: 'http://product-service:3001', changeOrigin: true }));
app.use('/api/orders', createProxyMiddleware({ target: 'http://order-service:3002', changeOrigin: true }));
app.use('/api/auth', createProxyMiddleware({ target: 'http://auth-service:3003', changeOrigin: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
