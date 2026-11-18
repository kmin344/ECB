const express = require('express');
const mongoose = require('mongoose');
const paymentRoutes = require('./routes/payment.routes');
const createPaymentController = require('./controllers/payment.controller');
const errorMiddleware = require('./middleware/error.middleware');
const stripeLib = require('./lib/stripe');
const orders = require('./lib/orders');

// Builds the app from the environment. Tests pass fakes for Stripe and order-service.
function buildApp(overrides = {}) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const deps = {
    stripe: secretKey ? stripeLib.createClient({ secretKey }) : null,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: (process.env.STORE_CURRENCY || 'usd').toLowerCase(),
    storeUrl: (process.env.STORE_URL || 'http://localhost').replace(/\/+$/, ''),
    orders,
    ...overrides,
  };

  const app = express();
  // Liveness: the process answers. Readiness: MongoDB is connected as well.
  app.get('/health', (req, res) => res.json({ ok: true }));
  app.get('/ready', (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ ok: ready });
  });
  app.use('/', paymentRoutes(createPaymentController(deps)));
  app.use(errorMiddleware);
  return app;
}

module.exports = { buildApp };
