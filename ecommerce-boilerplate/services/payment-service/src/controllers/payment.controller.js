// src/controllers/payment.controller.js
const Payment = require('../models/payment.model');
const logger = require('../utils/logger');

exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, amount, currency, method } = req.body;

    // Here you would typically integrate with a real payment gateway
    // For this example, we'll simulate a payment process
    const paymentSuccessful = Math.random() < 0.8; // 80% success rate

    const payment = new Payment({
      orderId,
      amount,
      currency,
      method,
      status: paymentSuccessful ? 'completed' : 'failed',
      transactionId: paymentSuccessful ? `tr_${Date.now()}` : null
    });

    await payment.save();

    if (paymentSuccessful) {
      res.status(200).json({ message: 'Payment processed successfully', payment });
    } else {
      res.status(400).json({ message: 'Payment processing failed', payment });
    }
  } catch (error) {
    logger.error('Error in processPayment:', error);
    next(error);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

exports.getPaymentsByOrder = async (req, res, next) => {
  try {
    const payments = await Payment.find({ orderId: req.params.orderId });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};