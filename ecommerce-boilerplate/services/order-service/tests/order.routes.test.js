// Exercises the real routes and JWT middleware with signed tokens.
// The Mongoose model and the product-service client are mocked.
process.env.JWT_SECRET = 'test-secret';
jest.mock('../src/models/order.model');
jest.mock('../src/lib/stock', () => {
  const actual = jest.requireActual('../src/lib/stock');
  return { StockError: actual.StockError, reserve: jest.fn(), release: jest.fn() };
});

const { JWT_SECRET } = process.env;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const Order = require('../src/models/order.model');
const stock = require('../src/lib/stock');
const app = require('../src/app');

const ALICE = '64b7f0c2a1b2c3d4e5f60001';
const BOB = '64b7f0c2a1b2c3d4e5f60002';
const ORDER_ID = '64b7f0c2a1b2c3d4e5f6a001';
const LAMP = '64b7f0c2a1b2c3d4e5f6b001';
const DESK = '64b7f0c2a1b2c3d4e5f6b002';

const as = (userId, role = 'user') => ({
  Authorization: `Bearer ${jwt.sign({ userId, role }, JWT_SECRET)}`,
});
const order = (status, user = ALICE) => ({
  _id: ORDER_ID,
  user,
  status,
  totalAmount: 10,
  products: [{ product: LAMP, quantity: 2 }],
});
const ADDRESS = '123 Test Street, Test City';

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
beforeEach(() => {
  jest.clearAllMocks();
  Order.find.mockImplementation(() => ({ sort: jest.fn().mockResolvedValue([order('pending')]) }));
  Order.findById.mockResolvedValue(order('pending'));
  Order.findOneAndUpdate.mockImplementation(async (filter, changes) => ({ ...order(filter.status), ...changes }));
  Order.create.mockImplementation(async (doc) => ({ _id: ORDER_ID, status: 'pending', ...doc }));
  stock.reserve.mockImplementation(async (items) =>
    items.map((i) => ({ ...i, name: i.productId === LAMP ? 'Lamp' : 'Desk', price: i.productId === LAMP ? 0.1 : 0.2 })),
  );
  stock.release.mockResolvedValue(undefined);
});

describe('POST / (place an order)', () => {
  it('prices the order from product-service and ignores the client total', async () => {
    const res = await request(app)
      .post('/')
      .set(as(ALICE))
      .send({
        products: [{ product: LAMP, quantity: 1 }, { product: DESK, quantity: 1 }, { product: LAMP, quantity: 2 }],
        totalAmount: 0.01,
        user: BOB,
        shippingAddress: ADDRESS,
      })
      .expect(201);

    // Repeated lines are added up before stock is taken.
    expect(stock.reserve).toHaveBeenCalledWith([
      { productId: LAMP, quantity: 3 },
      { productId: DESK, quantity: 1 },
    ]);
    // 3 x 0.10 + 1 x 0.20 in cents: exactly 0.5, not 0.5000000000000001
    expect(res.body.totalAmount).toBe(0.5);
    expect(res.body.user).toBe(ALICE);
    expect(res.body.products[0]).toEqual({ product: LAMP, quantity: 3, name: 'Lamp', price: 0.1 });
  });

  it.each([
    ['no lines', { products: [], shippingAddress: ADDRESS }],
    ['a bad product id', { products: [{ product: 'nope', quantity: 1 }], shippingAddress: ADDRESS }],
    ['a product id sent as an object', { products: [{ product: { $gt: '' }, quantity: 1 }], shippingAddress: ADDRESS }],
    ['a zero quantity', { products: [{ product: LAMP, quantity: 0 }], shippingAddress: ADDRESS }],
    ['a fractional quantity', { products: [{ product: LAMP, quantity: 1.5 }], shippingAddress: ADDRESS }],
    ['no address', { products: [{ product: LAMP, quantity: 1 }] }],
  ])('rejects %s', async (_label, body) => {
    await request(app).post('/').set(as(ALICE)).send(body).expect(400);
    expect(stock.reserve).not.toHaveBeenCalled();
  });

  it('answers 409 and saves nothing when stock is short', async () => {
    stock.reserve.mockRejectedValue(new stock.StockError(409, { message: 'Not enough stock', productId: LAMP }));
    const res = await request(app)
      .post('/')
      .set(as(ALICE))
      .send({ products: [{ product: LAMP, quantity: 99 }], shippingAddress: ADDRESS })
      .expect(409);
    expect(res.body).toEqual({ message: 'Not enough stock', productId: LAMP });
    expect(Order.create).not.toHaveBeenCalled();
  });

  it('answers 502 when product-service cannot be reached', async () => {
    stock.reserve.mockRejectedValue(new TypeError('fetch failed'));
    await request(app)
      .post('/')
      .set(as(ALICE))
      .send({ products: [{ product: LAMP, quantity: 1 }], shippingAddress: ADDRESS })
      .expect(502);
  });

  it('gives the stock back when the order cannot be saved', async () => {
    Order.create.mockRejectedValue(new Error('write failed'));
    await request(app)
      .post('/')
      .set(as(ALICE))
      .send({ products: [{ product: LAMP, quantity: 2 }], shippingAddress: ADDRESS })
      .expect(500);
    expect(stock.release).toHaveBeenCalledWith([{ productId: LAMP, quantity: 2 }]);
  });
});

describe('status changes', () => {
  it('lets an admin move an order forward', async () => {
    const res = await request(app).patch(`/${ORDER_ID}/status`).set(as(BOB, 'admin')).send({ status: 'shipped' }).expect(200);
    expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: ORDER_ID, status: 'pending' },
      expect.objectContaining({ status: 'shipped' }),
      { new: true },
    );
    expect(res.body.status).toBe('shipped');
    expect(stock.release).not.toHaveBeenCalled();
  });

  it('returns the stock when an admin cancels', async () => {
    await request(app).patch(`/${ORDER_ID}/status`).set(as(BOB, 'admin')).send({ status: 'cancelled' }).expect(200);
    expect(stock.release).toHaveBeenCalledWith([{ productId: LAMP, quantity: 2 }]);
  });

  it.each([
    ['cancelled', 'pending'],
    ['delivered', 'cancelled'],
    ['shipped', 'cancelled'],
  ])('refuses %s -> %s with 409', async (from, to) => {
    Order.findById.mockResolvedValue(order(from));
    await request(app).patch(`/${ORDER_ID}/status`).set(as(BOB, 'admin')).send({ status: to }).expect(409);
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
    expect(stock.release).not.toHaveBeenCalled();
  });

  it('returns stock once when two cancels race', async () => {
    // The second conditional update finds the status already changed.
    Order.findOneAndUpdate.mockResolvedValueOnce({ ...order('cancelled') }).mockResolvedValueOnce(null);
    const results = await Promise.all([
      request(app).patch(`/${ORDER_ID}/status`).set(as(BOB, 'admin')).send({ status: 'cancelled' }),
      request(app).patch(`/${ORDER_ID}/status`).set(as(BOB, 'admin')).send({ status: 'cancelled' }),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(stock.release).toHaveBeenCalledTimes(1);
  });

  it('rejects an unknown status', async () => {
    await request(app).patch(`/${ORDER_ID}/status`).set(as(BOB, 'admin')).send({ status: 'lost' }).expect(400);
  });
});

describe('customer cancel (POST /:id/cancel)', () => {
  it('cancels an own pending order and returns the stock', async () => {
    await request(app).post(`/${ORDER_ID}/cancel`).set(as(ALICE)).expect(200);
    expect(stock.release).toHaveBeenCalledTimes(1);
  });

  it("hides another user's order", async () => {
    await request(app).post(`/${ORDER_ID}/cancel`).set(as(BOB)).expect(404);
    expect(stock.release).not.toHaveBeenCalled();
  });

  it('refuses once the order is being processed', async () => {
    Order.findById.mockResolvedValue(order('processing'));
    await request(app).post(`/${ORDER_ID}/cancel`).set(as(ALICE)).expect(409);
    expect(stock.release).not.toHaveBeenCalled();
  });
});

describe('admin-only routes', () => {
  it('lists every order for admins', async () => {
    await request(app).get('/').set(as(BOB, 'admin')).expect(200);
  });

  it('lets admins change only the shipping address', async () => {
    Order.findByIdAndUpdate.mockResolvedValue({ ...order('pending'), shippingAddress: 'New address 1' });
    await request(app)
      .put(`/${ORDER_ID}`)
      .set(as(BOB, 'admin'))
      .send({ shippingAddress: 'New address 1', totalAmount: 0 })
      .expect(200);
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
      ORDER_ID,
      { shippingAddress: 'New address 1', updatedAt: expect.any(Number) },
      { new: true },
    );
  });

  it('deletes only cancelled orders', async () => {
    Order.findOneAndDelete.mockResolvedValue(null);
    Order.exists.mockResolvedValue({ _id: ORDER_ID });
    await request(app).delete(`/${ORDER_ID}`).set(as(BOB, 'admin')).expect(409);
    expect(Order.findOneAndDelete).toHaveBeenCalledWith({ _id: ORDER_ID, status: 'cancelled' });
  });

  it('refuses regular users', async () => {
    await request(app).get('/').set(as(ALICE)).expect(403);
    await request(app).patch(`/${ORDER_ID}/status`).set(as(ALICE)).send({ status: 'shipped' }).expect(403);
    await request(app).put(`/${ORDER_ID}`).set(as(ALICE)).send({ shippingAddress: ADDRESS }).expect(403);
    await request(app).delete(`/${ORDER_ID}`).set(as(ALICE)).expect(403);
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('requires a token', async () => {
    await request(app).get('/').expect(401);
  });
});

describe('reading orders', () => {
  it("lets a user read their own orders but not someone else's", async () => {
    await request(app).get(`/user/${ALICE}`).set(as(ALICE)).expect(200);
    await request(app).get(`/user/${ALICE}`).set(as(BOB)).expect(403);
  });

  it('hides orders that belong to another user', async () => {
    await request(app).get(`/${ORDER_ID}`).set(as(ALICE)).expect(200);
    await request(app).get(`/${ORDER_ID}`).set(as(BOB)).expect(404);
    await request(app).get(`/${ORDER_ID}`).set(as(BOB, 'admin')).expect(200);
  });
});
