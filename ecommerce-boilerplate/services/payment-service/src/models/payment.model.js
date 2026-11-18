const mongoose = require('mongoose');

// One Stripe Checkout session for one order. An order can have several
// (for example, the shopper left the first one and it expired).
const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    provider: { type: String, required: true, default: 'stripe' },
    sessionId: { type: String, required: true, unique: true },
    paymentIntentId: String,
    // In the store's units (19.99), like order totals.
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'succeeded', 'failed', 'expired', 'refunded'],
      default: 'pending',
    },
    url: String,
    expiresAt: Date,
  },
  { timestamps: true },
);

// At most one successful payment per order. A second success is refunded.
// Named, because the plain orderId index above already uses the default name "orderId_1".
PaymentSchema.index(
  { orderId: 1 },
  { name: 'one_success_per_order', unique: true, partialFilterExpression: { status: 'succeeded' } },
);

module.exports = mongoose.model('Payment', PaymentSchema);
