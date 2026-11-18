// Checkout and Stripe webhooks through the real routes, on a real MongoDB
// (mongodb-memory-server). Stripe and order-service are fakes.
process.env.JWT_SECRET = 'test-secret';
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const Payment = require('../src/models/payment.model');
const { buildApp } = require('../src/app');

jest.setTimeout(120000);

const WHSEC = 'whsec_test';
const ALICE = '64b7f0c2a1b2c3d4e5f60001';
const BOB = '64b7f0c2a1b2c3d4e5f60002';
const ORDER = '64b7f0c2a1b2c3d4e5f6a001';
const as = (userId, role = 'user') => ({ Authorization: `Bearer ${jwt.sign({ userId, role }, 'test-secret')}` });

const pendingOrder = () => ({
  _id: ORDER,
  user: ALICE,
  status: 'pending',
  totalAmount: 39.97,
  products: [
    { product: 'p1', quantity: 2, name: 'Lamp', price: 19.99 },
    { product: 'p2', quantity: 1, name: 'Bulb', price: -0.01 + 0.01 }, // 0: free gift line
  ],
});

let mongo;
let stripe;
let orders;
let app;
let sessionCount;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Payment.init(); // build the unique index before the tests
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Payment.deleteMany({});
  sessionCount = 0;
  stripe = {
    createCheckoutSession: jest.fn(async (params) => {
      sessionCount += 1;
      return { id: `cs_${sessionCount}`, url: `https://checkout.stripe.test/cs_${sessionCount}`, expires_at: params.expires_at };
    }),
    refund: jest.fn().mockResolvedValue({ id: 're_1' }),
  };
  orders = { getOrder: jest.fn().mockResolvedValue(pendingOrder()), markPaid: jest.fn().mockResolvedValue({}) };
  app = buildApp({ stripe, webhookSecret: WHSEC, currency: 'usd', storeUrl: 'https://shop.test', orders });
});

const signed = (event, secret = WHSEC, at = Math.floor(Date.now() / 1000)) => {
  const body = JSON.stringify(event);
  const sig = crypto.createHmac('sha256', secret).update(`${at}.${body}`).digest('hex');
  return { body, header: `t=${at},v1=${sig}` };
};
const sendWebhook = (event, opts) => {
  const { body, header } = signed(event, opts?.secret, opts?.at);
  return request(app).post('/webhook').set('content-type', 'application/json').set('stripe-signature', header).send(body);
};
const completed = (sessionId, amount = 3997) => ({
  type: 'checkout.session.completed',
  data: { object: { id: sessionId, payment_status: 'paid', amount_total: amount, currency: 'usd', payment_intent: `pi_${sessionId}` } },
});
const startCheckout = () => request(app).post('/checkout').set(as(ALICE)).send({ orderId: ORDER });

describe('POST /checkout', () => {
  it('creates a Stripe session from the stored order prices', async () => {
    const res = await startCheckout().expect(201);
    expect(res.body.url).toBe('https://checkout.stripe.test/cs_1');

    const [params, idempotencyKey] = stripe.createCheckoutSession.mock.calls[0];
    expect(params.line_items).toEqual([
      { quantity: 2, price_data: { currency: 'usd', unit_amount: 1999, product_data: { name: 'Lamp' } } },
      { quantity: 1, price_data: { currency: 'usd', unit_amount: 0, product_data: { name: 'Bulb' } } },
    ]);
    expect(params.success_url).toBe(`https://shop.test/order-confirmation?orderId=${ORDER}`);
    expect(params.client_reference_id).toBe(ORDER);
    expect(idempotencyKey).toBe(`checkout-${res.body.paymentId}`);

    const stored = await Payment.findById(res.body.paymentId);
    expect(stored).toMatchObject({ sessionId: 'cs_1', amount: 39.97, currency: 'usd', status: 'pending' });
  });

  it('reuses an open session instead of starting a second one', async () => {
    const first = await startCheckout().expect(201);
    const second = await startCheckout().expect(200);
    expect(second.body.url).toBe(first.body.url);
    expect(stripe.createCheckoutSession).toHaveBeenCalledTimes(1);
  });

  it("hides another user's order", async () => {
    await request(app).post('/checkout').set(as(BOB)).send({ orderId: ORDER }).expect(404);
    expect(stripe.createCheckoutSession).not.toHaveBeenCalled();
  });

  it('refuses an order that is no longer pending', async () => {
    orders.getOrder.mockResolvedValue({ ...pendingOrder(), status: 'cancelled' });
    await startCheckout().expect(409);
  });

  it('answers 503 when Stripe is not configured', async () => {
    app = buildApp({ stripe: null, webhookSecret: undefined, currency: 'usd', storeUrl: 'x', orders });
    await startCheckout().expect(503);
  });

  it('answers 502 without Stripe details when Stripe fails', async () => {
    const { StripeError } = require('../src/lib/stripe');
    stripe.createCheckoutSession.mockRejectedValue(new StripeError(401, { error: { message: 'Invalid API Key sk_live_xxx' } }));
    const res = await startCheckout().expect(502);
    expect(JSON.stringify(res.body)).not.toContain('sk_live');
    expect(await Payment.countDocuments()).toBe(0);
  });

  it('requires a token', async () => {
    await request(app).post('/checkout').send({ orderId: ORDER }).expect(401);
  });
});

describe('POST /webhook', () => {
  it('rejects a bad signature, a wrong secret and an old timestamp', async () => {
    await startCheckout().expect(201);
    await request(app).post('/webhook').set('content-type', 'application/json').set('stripe-signature', 't=1,v1=00').send('{}').expect(400);
    await sendWebhook(completed('cs_1'), { secret: 'whsec_other' }).expect(400);
    await sendWebhook(completed('cs_1'), { at: Math.floor(Date.now() / 1000) - 600 }).expect(400);
    expect(orders.markPaid).not.toHaveBeenCalled();
  });

  it('marks the payment succeeded and the order paid', async () => {
    await startCheckout().expect(201);
    await sendWebhook(completed('cs_1')).expect(200);
    expect(await Payment.findOne({ sessionId: 'cs_1' })).toMatchObject({ status: 'succeeded', paymentIntentId: 'pi_cs_1' });
    expect(orders.markPaid).toHaveBeenCalledWith(ORDER);
  });

  it('can receive the same event twice', async () => {
    await startCheckout().expect(201);
    await sendWebhook(completed('cs_1')).expect(200);
    await sendWebhook(completed('cs_1')).expect(200);
    expect(stripe.refund).not.toHaveBeenCalled();
    expect(await Payment.countDocuments({ status: 'succeeded' })).toBe(1);
  });

  it('answers 500 when order-service is down, and finishes on the retry', async () => {
    await startCheckout().expect(201);
    orders.markPaid.mockRejectedValueOnce(Object.assign(new Error('fetch failed'), { status: undefined }));
    await sendWebhook(completed('cs_1')).expect(500);
    await sendWebhook(completed('cs_1')).expect(200);
    expect(orders.markPaid).toHaveBeenCalledTimes(2);
  });

  it('refunds a payment for an order that was cancelled meanwhile', async () => {
    await startCheckout().expect(201);
    orders.markPaid.mockRejectedValue(Object.assign(new Error('cancelled'), { status: 409, body: { status: 'cancelled' } }));
    await sendWebhook(completed('cs_1')).expect(200);
    expect(stripe.refund).toHaveBeenCalledWith('pi_cs_1', expect.stringMatching(/^refund-/));
    expect((await Payment.findOne({ sessionId: 'cs_1' })).status).toBe('refunded');
  });

  it('refunds a second payment for an order that is already paid', async () => {
    await startCheckout().expect(201);
    // The first session expired from our point of view; the shopper opened a second one.
    await Payment.updateOne({ sessionId: 'cs_1' }, { expiresAt: new Date(Date.now() - 1000) });
    await startCheckout().expect(201);

    await sendWebhook(completed('cs_1')).expect(200);
    await sendWebhook(completed('cs_2')).expect(200);

    expect(stripe.refund).toHaveBeenCalledTimes(1);
    expect(stripe.refund).toHaveBeenCalledWith('pi_cs_2', expect.any(String));
    expect((await Payment.findOne({ sessionId: 'cs_2' })).status).toBe('refunded');
  });

  it('waits for delayed payment methods, then records the result', async () => {
    await startCheckout().expect(201);
    const unpaid = completed('cs_1');
    unpaid.data.object.payment_status = 'unpaid';
    await sendWebhook(unpaid).expect(200);
    expect(orders.markPaid).not.toHaveBeenCalled();

    await sendWebhook({ ...completed('cs_1'), type: 'checkout.session.async_payment_succeeded' }).expect(200);
    expect(orders.markPaid).toHaveBeenCalledTimes(1);
  });

  it('marks expired sessions', async () => {
    await startCheckout().expect(201);
    await sendWebhook({ type: 'checkout.session.expired', data: { object: { id: 'cs_1' } } }).expect(200);
    expect((await Payment.findOne({ sessionId: 'cs_1' })).status).toBe('expired');
  });

  it('ignores sessions it did not create', async () => {
    await sendWebhook(completed('cs_unknown')).expect(200);
    expect(orders.markPaid).not.toHaveBeenCalled();
  });
});

describe('reading payments', () => {
  it('shows payments only to the owner and admins, without the checkout URL', async () => {
    const { body } = await startCheckout().expect(201);
    const own = await request(app).get(`/order/${ORDER}`).set(as(ALICE)).expect(200);
    expect(own.body).toHaveLength(1);
    expect(own.body[0].url).toBeUndefined();
    expect((await request(app).get(`/order/${ORDER}`).set(as(BOB)).expect(200)).body).toHaveLength(0);
    await request(app).get(`/${body.paymentId}`).set(as(BOB)).expect(404);
    await request(app).get(`/${body.paymentId}`).set(as(BOB, 'admin')).expect(200);
  });
});
