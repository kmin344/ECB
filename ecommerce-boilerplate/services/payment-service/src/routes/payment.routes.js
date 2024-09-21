// src/routes/payment.routes.js
const express = require('express');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/process', paymentController.processPayment);
router.get('/:id', paymentController.getPaymentStatus);
router.get('/order/:orderId', paymentController.getPaymentsByOrder);

module.exports = router;