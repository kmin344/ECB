// Exercises the real routes. Only the model is mocked.
process.env.JWT_SECRET = 'test-secret';
jest.mock('../src/models/product.model');

const request = require('supertest');
const Product = require('../src/models/product.model');
const app = require('../src/app');

const PRODUCT = '64b7f0c2a1b2c3d4e5f6b001';

let query;
beforeEach(() => {
  jest.clearAllMocks();
  query = { sort: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([{ name: 'Lamp' }]) };
  Product.find.mockReturnValue(query);
});

it('returns other products in the same category (GET /products/related)', async () => {
  const res = await request(app)
    .get('/related')
    .query({ productId: PRODUCT, category: 'Lighting' })
    .expect(200);

  expect(Product.find).toHaveBeenCalledWith({ category: 'Lighting', _id: { $ne: PRODUCT } });
  expect(query.limit).toHaveBeenCalledWith(4);
  expect(res.body).toEqual([{ name: 'Lamp' }]);
  expect(Product.findById).not.toHaveBeenCalled(); // not routed to /:productId
});

it('requires a category', async () => {
  await request(app).get('/related').expect(400);
});
