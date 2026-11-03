// Exercises the real routes and JWT middleware with signed tokens.
// Only the Mongoose models are mocked.
process.env.JWT_SECRET = 'test-secret';
jest.mock('../src/models/order.model');

const { JWT_SECRET } = process.env;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const Order = require('../src/models/order.model');
const app = require('../src/app');

const ALICE = '64b7f0c2a1b2c3d4e5f60001';
const BOB = '64b7f0c2a1b2c3d4e5f60002';
const ORDER_ID = '64b7f0c2a1b2c3d4e5f6a001';

const as = (userId, role = 'user') => ({
  Authorization: `Bearer ${jwt.sign({ userId, role }, JWT_SECRET)}`,
});
const aliceOrder = { _id: ORDER_ID, user: ALICE, status: 'pending', totalAmount: 10 };

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
beforeEach(() => {
  jest.clearAllMocks();
  Order.find.mockImplementation(() => ({ sort: jest.fn().mockResolvedValue([aliceOrder]) }));
  Order.findById.mockResolvedValue(aliceOrder);
  Order.findByIdAndUpdate.mockImplementation(async (id, changes) => ({ ...aliceOrder, ...changes }));
});

describe('admin dashboard routes', () => {
  it('lists every order for admins (GET /orders)', async () => {
    const res = await request(app).get('/').set(as(BOB, 'admin')).expect(200);
    expect(res.body).toEqual([aliceOrder]);
  });

  it('updates an order status for admins (PATCH /orders/:id/status)', async () => {
    const res = await request(app)
      .patch(`/${ORDER_ID}/status`)
      .set(as(BOB, 'admin'))
      .send({ status: 'shipped' })
      .expect(200);
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
      ORDER_ID,
      expect.objectContaining({ status: 'shipped' }),
      expect.objectContaining({ runValidators: true }),
    );
    expect(res.body.status).toBe('shipped');
  });

  it('rejects both for regular users', async () => {
    await request(app).get('/').set(as(ALICE)).expect(403);
    await request(app).patch(`/${ORDER_ID}/status`).set(as(ALICE)).send({ status: 'shipped' }).expect(403);
    await request(app).put(`/${ORDER_ID}`).set(as(ALICE)).send({ totalAmount: 0 }).expect(403);
    await request(app).delete(`/${ORDER_ID}`).set(as(ALICE)).expect(403);
    expect(Order.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('requires a token', async () => {
    await request(app).get('/').expect(401);
  });
});

describe('customer routes', () => {
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
