// Exercises the real routes and JWT middleware with signed tokens.
// Only the Mongoose models are mocked.
process.env.JWT_SECRET = 'test-secret';
jest.mock('../src/models/review.model');
jest.mock('../src/models/product.model');
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), error: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const Review = require('../src/models/review.model');
const app = require('../src/app');

const ALICE = '64b7f0c2a1b2c3d4e5f60001';
const BOB = '64b7f0c2a1b2c3d4e5f60002';
const PRODUCT = '64b7f0c2a1b2c3d4e5f6b001';
const REVIEW_ID = '64b7f0c2a1b2c3d4e5f6c001';

const as = (userId, role = 'user') => ({
  Authorization: `Bearer ${jwt.sign({ userId, role }, process.env.JWT_SECRET)}`,
});
const review = { _id: REVIEW_ID, productId: PRODUCT, userId: ALICE, rating: 5, comment: 'Great', status: 'approved' };

beforeEach(() => {
  jest.clearAllMocks();
  Review.find.mockImplementation(() => {
    const result = Promise.resolve([review]);
    result.sort = jest.fn().mockResolvedValue([review]);
    return result;
  });
  Review.findById.mockResolvedValue(review);
  Review.findByIdAndUpdate.mockImplementation(async (id, changes) => ({ ...review, ...changes }));
  Review.findOneAndDelete.mockResolvedValue(review);
});

describe('admin dashboard routes', () => {
  it('lists all reviews for admins (GET /reviews)', async () => {
    const res = await request(app).get('/').set(as(BOB, 'admin')).expect(200);
    expect(res.body).toEqual([review]);
  });

  it('gets a single review (GET /reviews/:id)', async () => {
    await request(app).get(`/${REVIEW_ID}`).expect(200);
  });

  it('changes a review status for admins (PATCH /reviews/:id/status)', async () => {
    const res = await request(app)
      .patch(`/${REVIEW_ID}/status`)
      .set(as(BOB, 'admin'))
      .send({ status: 'rejected' })
      .expect(200);
    expect(res.body.status).toBe('rejected');
  });

  it('lets admins delete any review', async () => {
    await request(app).delete(`/${REVIEW_ID}`).set(as(BOB, 'admin')).expect(200);
    expect(Review.findOneAndDelete).toHaveBeenCalledWith({ _id: REVIEW_ID });
  });

  it('keeps listing and moderation admin-only', async () => {
    await request(app).get('/').set(as(ALICE)).expect(403);
    await request(app).patch(`/${REVIEW_ID}/status`).set(as(ALICE)).send({ status: 'approved' }).expect(403);
    expect(Review.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});

describe('storefront routes', () => {
  it('hides rejected reviews on the product page', async () => {
    await request(app).get(`/product/${PRODUCT}`).expect(200);
    expect(Review.find).toHaveBeenCalledWith({ productId: PRODUCT, status: { $ne: 'rejected' } });
  });

  it("only deletes a regular user's own review", async () => {
    await request(app).delete(`/${REVIEW_ID}`).set(as(ALICE)).expect(200);
    expect(Review.findOneAndDelete).toHaveBeenCalledWith({ _id: REVIEW_ID, userId: ALICE });
  });
});
