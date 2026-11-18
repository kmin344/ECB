// Who may read and change the catalog. Real routes and JWT middleware; only the model is mocked.
process.env.JWT_SECRET = 'test-secret';
jest.mock('../src/models/product.model');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const Product = require('../src/models/product.model');
const app = require('../src/app');

const PRODUCT = '64b7f0c2a1b2c3d4e5f6b001';
const as = (role, secret = process.env.JWT_SECRET) => ({
  Authorization: `Bearer ${jwt.sign({ userId: 'u1', role }, secret)}`,
});
const lamp = { name: 'Lamp', price: 10, stock: 3, category: 'Lighting', thumbnail: 'x', description: 'x' };

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
beforeEach(() => {
  jest.clearAllMocks();
  Product.find.mockResolvedValue([lamp]);
  Product.findById.mockResolvedValue(lamp);
  Product.findByIdAndUpdate.mockResolvedValue({ ...lamp, stock: 5 });
  Product.findByIdAndDelete.mockResolvedValue(lamp);
  Product.prototype.save = jest.fn().mockResolvedValue({ _id: PRODUCT, ...lamp });
});

describe('public catalog', () => {
  it('lists products without a token', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.body).toEqual([lamp]);
  });

  it('reads one product without a token', async () => {
    await request(app).get(`/${PRODUCT}`).expect(200);
  });

  it('rejects a category sent as an object (query operator)', async () => {
    await request(app).get('/related').query({ 'category[$ne]': 'x' }).expect(400);
    expect(Product.find).not.toHaveBeenCalled();
  });
});

describe('catalog changes', () => {
  it('requires a token', async () => {
    await request(app).post('/').send(lamp).expect(401);
    await request(app).put(`/${PRODUCT}`).send({ stock: 5 }).expect(401);
    await request(app).delete(`/${PRODUCT}`).expect(401);
  });

  it('refuses customers', async () => {
    await request(app).post('/').set(as('user')).send(lamp).expect(403);
    await request(app).put(`/${PRODUCT}`).set(as('user')).send({ stock: 5 }).expect(403);
    await request(app).delete(`/${PRODUCT}`).set(as('user')).expect(403);
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(Product.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('allows admins', async () => {
    await request(app).post('/').set(as('admin')).send(lamp).expect(201);
    await request(app).put(`/${PRODUCT}`).set(as('admin')).send({ stock: 5 }).expect(200);
    await request(app).delete(`/${PRODUCT}`).set(as('admin')).expect(200);
  });

  it('rejects an admin token signed with another secret', async () => {
    await request(app).post('/').set(as('admin', 'your-secret-key')).send(lamp).expect(401);
  });

  it('rejects an unsigned token (alg "none")', async () => {
    const unsigned = jwt.sign({ userId: 'u1', role: 'admin' }, null, { algorithm: 'none' });
    await request(app).post('/').set({ Authorization: `Bearer ${unsigned}` }).send(lamp).expect(401);
  });
});

it('hides internal error text on a 500', async () => {
  Product.find.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.5:27017'));
  const res = await request(app).get('/').expect(500);
  expect(JSON.stringify(res.body)).not.toContain('ECONNREFUSED');
});
