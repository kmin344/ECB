const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const logger = require('../utils/logger');
const { verifySignature, toMinorUnits, StripeError } = require('../lib/stripe');

const SESSION_MINUTES = 30; // Stripe allows 30 minutes to 24 hours

// deps: { stripe (client or null), webhookSecret, currency, storeUrl, orders }
module.exports = function createPaymentController({ stripe, webhookSecret, currency, storeUrl, orders }) {
  const isOwnerOrAdmin = (req, userId) => req.user.role === 'admin' || String(userId) === String(req.user.id);

  // Starts a Stripe Checkout session for one of the caller's pending orders and
  // returns the URL of Stripe's payment page. Prices come from the stored order.
  async function checkout(req, res, next) {
    try {
      if (!stripe) return res.status(503).json({ message: 'Payments are not configured' });

      const { orderId } = req.body || {};
      if (typeof orderId !== 'string' || !mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'orderId is required' });
      }

      let order;
      try {
        order = await orders.getOrder(orderId);
      } catch (error) {
        if (error.status === 404) return res.status(404).json({ message: 'Order not found' });
        logger.error(`Could not read order ${orderId}: ${error.message}`);
        return res.status(502).json({ message: 'Orders are not available, try again later' });
      }
      if (String(order.user) !== String(req.user.id)) return res.status(404).json({ message: 'Order not found' });
      if (order.status !== 'pending' || order.paidAt) {
        return res.status(409).json({ message: `An order that is ${order.status} cannot be paid` });
      }

      // A session that is still open is reused, so a reload does not start a second payment.
      const open = await Payment.findOne({
        orderId,
        status: 'pending',
        expiresAt: { $gt: new Date(Date.now() + 60 * 1000) },
      }).sort({ createdAt: -1 });
      if (open) return res.json({ paymentId: open._id, url: open.url });

      const paymentId = new mongoose.Types.ObjectId();
      const session = await stripe.createCheckoutSession(
        {
          mode: 'payment',
          client_reference_id: orderId,
          metadata: { orderId, paymentId: String(paymentId) },
          payment_intent_data: { metadata: { orderId } },
          line_items: order.products.map((line) => ({
            quantity: line.quantity,
            price_data: {
              currency,
              unit_amount: toMinorUnits(line.price, currency),
              product_data: { name: line.name || 'Item' },
            },
          })),
          success_url: `${storeUrl}/order-confirmation?orderId=${orderId}`,
          cancel_url: `${storeUrl}/checkout?orderId=${orderId}&cancelled=1`,
          expires_at: Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60,
        },
        `checkout-${paymentId}`,
      );

      const payment = await Payment.create({
        _id: paymentId,
        orderId,
        userId: req.user.id,
        sessionId: session.id,
        amount: order.totalAmount,
        currency,
        url: session.url,
        expiresAt: new Date(session.expires_at * 1000),
      });
      res.status(201).json({ paymentId: payment._id, url: session.url });
    } catch (error) {
      if (error instanceof StripeError) {
        logger.error(`Stripe refused a checkout session: ${error.message}`);
        return res.status(502).json({ message: 'The payment provider is not available, try again later' });
      }
      next(error);
    }
  }

  async function refund(payment, paymentIntentId, reason) {
    logger.warn(`Refunding payment ${payment._id} for order ${payment.orderId}: ${reason}`);
    await stripe.refund(paymentIntentId, `refund-${payment._id}`);
    await Payment.updateOne({ _id: payment._id }, { status: 'refunded', paymentIntentId });
  }

  // A completed payment. Safe to receive more than once: Stripe retries until it gets a 2xx.
  async function onPaid(session) {
    const payment = await Payment.findOne({ sessionId: session.id });
    if (!payment) {
      logger.warn(`Ignoring payment for unknown session ${session.id}`);
      return;
    }
    if (payment.status === 'refunded') return;

    const expected = toMinorUnits(payment.amount, payment.currency);
    if (session.amount_total !== expected || session.currency !== payment.currency) {
      logger.error(`Session ${session.id} charged ${session.amount_total} ${session.currency}, expected ${expected} ${payment.currency}`);
    }

    if (payment.status !== 'succeeded') {
      try {
        // The unique index allows one succeeded payment per order.
        await Payment.updateOne({ _id: payment._id }, { status: 'succeeded', paymentIntentId: session.payment_intent });
      } catch (error) {
        if (error.code === 11000) {
          return refund(payment, session.payment_intent, 'the order was already paid by another session');
        }
        throw error;
      }
    }

    try {
      await orders.markPaid(String(payment.orderId));
    } catch (error) {
      if (error.status === 409) {
        return refund(payment, session.payment_intent, `the order is ${error.body?.status || 'not payable'}`);
      }
      throw error; // order-service unavailable: answer 500 so Stripe retries
    }
  }

  async function onClosed(session, status) {
    await Payment.updateOne({ sessionId: session.id, status: 'pending' }, { status });
  }

  // Stripe's webhook. The body must be the raw bytes Stripe signed.
  async function webhook(req, res, next) {
    try {
      if (!webhookSecret) return res.status(503).json({ message: 'Payments are not configured' });
      if (!verifySignature(req.body, req.get('stripe-signature'), webhookSecret)) {
        return res.status(400).json({ message: 'Invalid signature' });
      }

      const event = JSON.parse(req.body.toString('utf8'));
      const session = event.data && event.data.object;
      switch (event.type) {
        case 'checkout.session.completed':
          // Card payments are 'paid' here; delayed methods report later.
          if (session.payment_status === 'paid') await onPaid(session);
          break;
        case 'checkout.session.async_payment_succeeded':
          await onPaid(session);
          break;
        case 'checkout.session.async_payment_failed':
          await onClosed(session, 'failed');
          break;
        case 'checkout.session.expired':
          await onClosed(session, 'expired');
          break;
        default:
          break; // other events are not used
      }
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async function getPaymentsForOrder(req, res, next) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) return res.json([]);
      const filter = { orderId: req.params.orderId };
      if (req.user.role !== 'admin') filter.userId = req.user.id;
      const payments = await Payment.find(filter, '-url').sort({ createdAt: -1 });
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }

  async function getPayment(req, res, next) {
    try {
      const payment = mongoose.Types.ObjectId.isValid(req.params.id) ? await Payment.findById(req.params.id, '-url') : null;
      if (!payment || !isOwnerOrAdmin(req, payment.userId)) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  return { checkout, webhook, getPaymentsForOrder, getPayment };
};
