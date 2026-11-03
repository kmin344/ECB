// Exercises the real Express app (routes + auth middleware + controller)
// with a signed JWT. Only the Mongoose model is mocked.
process.env.JWT_SECRET = 'test-secret';

jest.mock('../../src/models/cart.model');
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), error: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const Cart = require('../../src/models/cart.model');
const app = require('../../src/app');

const USER_ID = '64b7f0c2a1b2c3d4e5f60718';
// Same payload shape auth-service signs: { userId }
const token = jwt.sign({ userId: USER_ID }, process.env.JWT_SECRET);
const auth = { Authorization: `Bearer ${token}` };

const storedCart = (items) => ({
  userId: USER_ID,
  items: items.map((i) => ({ ...i, productId: { toString: () => i.productId } })),
  save: jest.fn().mockResolvedValue(undefined),
});

beforeEach(() => jest.clearAllMocks());

it('rejects requests without a token', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(401);
  expect(Cart.findOne).not.toHaveBeenCalled();
});

it('rejects a token signed with a different secret', async () => {
  const forged = jwt.sign({ userId: USER_ID }, 'wrong-secret');
  const res = await request(app).get('/').set('Authorization', `Bearer ${forged}`);
  expect(res.status).toBe(401);
});

it('looks up the cart of the user in the token', async () => {
  Cart.findOne.mockResolvedValue(storedCart([{ productId: 'p1', quantity: 2 }]));

  const res = await request(app).get('/').set(auth);

  expect(res.status).toBe(200);
  expect(Cart.findOne).toHaveBeenCalledWith({ userId: USER_ID });
  expect(res.body.items).toHaveLength(1);
});

it('adds an item for the authenticated user', async () => {
  Cart.findOne.mockResolvedValue(null);
  const created = storedCart([]);
  Cart.mockImplementation(() => created);

  const res = await request(app).post('/items').set(auth).send({ productId: 'p1', quantity: 3 });

  expect(res.status).toBe(201);
  expect(Cart).toHaveBeenCalledWith({ userId: USER_ID, items: [] });
  expect(created.save).toHaveBeenCalled();
});

it('clears the cart', async () => {
  const cart = storedCart([{ productId: 'p1', quantity: 1 }]);
  Cart.findOne.mockResolvedValue(cart);

  const res = await request(app).delete('/').set(auth);

  expect(res.status).toBe(200);
  expect(cart.items).toEqual([]);
});
