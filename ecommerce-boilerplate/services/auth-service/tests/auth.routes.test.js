// Registration and login through the real routes. Only the User model is mocked.
process.env.JWT_SECRET = 'test-secret';
jest.mock('../src/models/user.model');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user.model');
const app = require('../src/app');

const USER_ID = '64b7f0c2a1b2c3d4e5f60001';
const valid = { username: 'alice', email: 'Alice@Example.com', password: 'correct-horse' };

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
beforeEach(() => {
  jest.clearAllMocks();
  User.findOne.mockResolvedValue(null);
  User.prototype.save = jest.fn().mockResolvedValue(undefined);
});

describe('POST /register', () => {
  it('creates a customer and returns a token with role "user"', async () => {
    User.mockImplementation(function (fields) {
      Object.assign(this, fields, { _id: USER_ID, role: 'user' });
    });
    User.prototype.save = jest.fn().mockResolvedValue(undefined);

    const res = await request(app).post('/register').send({ ...valid, role: 'admin' }).expect(201);

    const claims = jwt.verify(res.body.token, 'test-secret');
    expect(claims).toMatchObject({ userId: USER_ID, role: 'user' });
    // role from the request body is ignored
    expect(User).toHaveBeenCalledWith({ username: 'alice', email: valid.email, password: valid.password });
  });

  it.each([
    ['a short password', { ...valid, password: 'short' }],
    ['a bad email', { ...valid, email: 'not-an-email' }],
    ['a short username', { ...valid, username: 'al' }],
    ['an email sent as an object', { ...valid, email: { $ne: null } }],
  ])('rejects %s', async (_label, body) => {
    await request(app).post('/register').send(body).expect(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('rejects a taken email or username', async () => {
    User.findOne.mockResolvedValue({ _id: USER_ID });
    await request(app).post('/register').send(valid).expect(400);
  });

  it('maps a duplicate-key race to 400', async () => {
    User.mockImplementation(function (fields) {
      Object.assign(this, fields);
    });
    User.prototype.save = jest.fn().mockRejectedValue(Object.assign(new Error('E11000'), { code: 11000 }));
    await request(app).post('/register').send(valid).expect(400);
  });
});

describe('POST /login', () => {
  const stored = (passwordOk) => ({
    _id: USER_ID,
    username: 'alice',
    email: 'alice@example.com',
    role: 'admin',
    comparePassword: jest.fn().mockResolvedValue(passwordOk),
  });

  it('returns a token that carries the stored role', async () => {
    User.findOne.mockResolvedValue(stored(true));
    const res = await request(app).post('/login').send({ email: 'ALICE@example.com', password: 'pw' }).expect(200);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'alice@example.com' });
    expect(jwt.verify(res.body.token, 'test-secret')).toMatchObject({ userId: USER_ID, role: 'admin' });
    expect(res.body.user).toEqual({ _id: USER_ID, username: 'alice', email: 'alice@example.com' });
  });

  it('rejects a wrong password and an unknown email the same way', async () => {
    User.findOne.mockResolvedValue(stored(false));
    const wrong = await request(app).post('/login').send({ email: 'alice@example.com', password: 'x' }).expect(400);
    User.findOne.mockResolvedValue(null);
    const unknown = await request(app).post('/login').send({ email: 'bob@example.com', password: 'x' }).expect(400);
    expect(wrong.body).toEqual(unknown.body);
  });

  it('rejects an email sent as a query operator', async () => {
    await request(app).post('/login').send({ email: { $ne: null }, password: 'x' }).expect(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('hides internal error text on a 500', async () => {
    User.findOne.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.5:27017'));
    const res = await request(app).post('/login').send({ email: 'a@b.co', password: 'x' }).expect(500);
    expect(JSON.stringify(res.body)).not.toContain('ECONNREFUSED');
  });
});
