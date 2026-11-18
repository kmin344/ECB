// Stock reservation against a real MongoDB (mongodb-memory-server), through the
// real routes. Proves the atomic decrement: concurrent orders cannot oversell.
process.env.JWT_SECRET = 'test-secret';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const Product = require('../src/models/product.model');
const app = require('../src/app');

jest.setTimeout(120000); // the first run downloads a MongoDB binary

const sign = (claims) => ({ Authorization: `Bearer ${jwt.sign(claims, process.env.JWT_SECRET)}` });
const SERVICE = sign({ role: 'service', service: 'order-service' });
const product = (stock, price = 10) =>
  Product.create({ name: 'Lamp', thumbnail: 'x', description: 'x', category: 'Lighting', price, stock });
const stockOf = async (p) => (await Product.findById(p._id)).stock;

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
beforeEach(() => Product.deleteMany({}));

it('lets only one of 10 concurrent orders take the last unit', async () => {
  const lamp = await product(1);
  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      request(app)
        .post('/internal/reserve')
        .set(SERVICE)
        .send({ items: [{ productId: String(lamp._id), quantity: 1 }] }),
    ),
  );
  expect(results.filter((r) => r.status === 200)).toHaveLength(1);
  expect(results.filter((r) => r.status === 409)).toHaveLength(9);
  expect(await stockOf(lamp)).toBe(0);
});

it('returns the current price and name', async () => {
  const lamp = await product(5, 19.99);
  const res = await request(app)
    .post('/internal/reserve')
    .set(SERVICE)
    .send({ items: [{ productId: String(lamp._id), quantity: 2 }] })
    .expect(200);
  expect(res.body.items).toEqual([{ productId: String(lamp._id), quantity: 2, name: 'Lamp', price: 19.99 }]);
  expect(await stockOf(lamp)).toBe(3);
});

it('takes nothing when one item is short (gives back the items already taken)', async () => {
  const lamp = await product(5);
  const desk = await product(1);
  const res = await request(app)
    .post('/internal/reserve')
    .set(SERVICE)
    .send({
      items: [
        { productId: String(lamp._id), quantity: 2 },
        { productId: String(desk._id), quantity: 3 },
      ],
    })
    .expect(409);
  expect(res.body.productId).toBe(String(desk._id));
  expect(await stockOf(lamp)).toBe(5);
  expect(await stockOf(desk)).toBe(1);
});

it('answers 404 for a product that does not exist', async () => {
  const missing = String(new mongoose.Types.ObjectId());
  await request(app)
    .post('/internal/reserve')
    .set(SERVICE)
    .send({ items: [{ productId: missing, quantity: 1 }] })
    .expect(404);
});

it('releases stock', async () => {
  const lamp = await product(0);
  await request(app)
    .post('/internal/release')
    .set(SERVICE)
    .send({ items: [{ productId: String(lamp._id), quantity: 4 }] })
    .expect(204);
  expect(await stockOf(lamp)).toBe(4);
});

it('refuses customer and admin tokens', async () => {
  const lamp = await product(5);
  const body = { items: [{ productId: String(lamp._id), quantity: 5 }] };
  await request(app).post('/internal/reserve').set(sign({ userId: 'u1', role: 'user' })).send(body).expect(403);
  await request(app).post('/internal/release').set(sign({ userId: 'u1', role: 'admin' })).send(body).expect(403);
  await request(app).post('/internal/reserve').send(body).expect(401);
  expect(await stockOf(lamp)).toBe(5);
});

it.each([
  ['a duplicate product', (id) => [{ productId: id, quantity: 1 }, { productId: id, quantity: 1 }]],
  ['a negative quantity', (id) => [{ productId: id, quantity: -5 }]],
  ['a product id sent as an object', () => [{ productId: { $ne: null }, quantity: 1 }]],
])('rejects %s', async (_label, items) => {
  const lamp = await product(5);
  await request(app).post('/internal/reserve').set(SERVICE).send({ items: items(String(lamp._id)) }).expect(400);
  expect(await stockOf(lamp)).toBe(5);
});
