const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Express strips the mount path before the proxy runs, so
// /api/products/123 reaches product-service as /123.
const createProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
  });

router.get('/', (req, res) => {
  res.send('Welcome to the E-commerce API Gateway');
});

// Each target can be overridden with an env var, e.g. for running locally.
const routes = [
  ['/api/auth', process.env.AUTH_SERVICE_URL || 'http://auth-service:3000'],
  ['/api/products', process.env.PRODUCT_SERVICE_URL || 'http://product-service:3000'],
  ['/api/orders', process.env.ORDER_SERVICE_URL || 'http://order-service:3000'],
  ['/api/users', process.env.USER_SERVICE_URL || 'http://user-service:3000'],
  ['/api/reviews', process.env.REVIEW_SERVICE_URL || 'http://review-service:3000'],
  ['/api/carts', process.env.CART_SERVICE_URL || 'http://cart-service:3000'],
  ['/api/payments', process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3000'],
];

for (const [path, target] of routes) {
  router.use(path, createProxy(target));
}

module.exports = router;
