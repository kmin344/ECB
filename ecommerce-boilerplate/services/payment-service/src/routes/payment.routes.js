const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');

module.exports = function paymentRoutes(controller) {
  const router = express.Router();

  // Stripe calls this without a user token; the signature proves the sender.
  // express.raw keeps the exact bytes that Stripe signed.
  router.post('/webhook', express.raw({ type: 'application/json', limit: '1mb' }), controller.webhook);

  router.use(authMiddleware);
  router.post('/checkout', express.json({ limit: '10kb' }), controller.checkout);
  router.get('/order/:orderId', controller.getPaymentsForOrder);
  router.get('/:id', controller.getPayment);

  return router;
};
