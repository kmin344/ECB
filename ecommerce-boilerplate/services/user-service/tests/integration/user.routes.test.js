// Exercises the real routes, JWT middleware and role checks.
// Only the Mongoose model is mocked.
process.env.JWT_SECRET = 'test-secret';

jest.mock('../../src/models/user.model');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user.model');
const app = require('../../src/app');

const ALICE = '64b7f0c2a1b2c3d4e5f60001';
const BOB = '64b7f0c2a1b2c3d4e5f60002';
const ADMIN = '64b7f0c2a1b2c3d4e5f600aa';
const roles = { [ALICE]: 'user', [BOB]: 'user', [ADMIN]: 'admin' };

const as = (userId) => ({ Authorization: `Bearer ${jwt.sign({ userId }, process.env.JWT_SECRET)}` });

beforeEach(() => {
  jest.clearAllMocks();
  // Role lookup done by the access middleware, and the profile lookup in getUserById.
  User.findById.mockImplementation(async (id) => (roles[id] ? { _id: id, role: roles[id] } : null));
  User.find.mockResolvedValue([]);
  User.findByIdAndDelete.mockResolvedValue({ _id: BOB });
  User.findByIdAndUpdate.mockImplementation((id, changes) => ({
    select: jest.fn().mockResolvedValue({ _id: id, ...changes }),
  }));
});

describe('authentication', () => {
  it('rejects requests without a token', async () => {
    await request(app).get(`/${ALICE}`).expect(401);
  });

  it('rejects tokens for users that no longer exist', async () => {
    await request(app).get('/').set(as('64b7f0c2a1b2c3d4e5f6ffff')).expect(401);
  });
});

describe('admin-only routes', () => {
  it('blocks regular users from listing, creating or deleting users', async () => {
    await request(app).get('/').set(as(ALICE)).expect(403);
    await request(app).post('/').set(as(ALICE)).send({ username: 'x' }).expect(403);
    await request(app).delete(`/${BOB}`).set(as(ALICE)).expect(403);
    expect(User.find).not.toHaveBeenCalled();
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('lets admins list and delete users', async () => {
    await request(app).get('/').set(as(ADMIN)).expect(200);
    await request(app).delete(`/${BOB}`).set(as(ADMIN)).expect(200);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(BOB);
  });

  it('creates users with the plain password so the model hashes it once', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    User.mockImplementation((data) => ({ _id: 'new-id', ...data, save }));

    await request(app)
      .post('/')
      .set(as(ADMIN))
      .send({ username: 'carol', email: 'carol@example.com', password: 'secret123' })
      .expect(201);

    expect(User).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'carol', password: 'secret123' }),
    );
  });
});

describe('own-account routes', () => {
  it("lets a user read their own account but not someone else's", async () => {
    await request(app).get(`/${ALICE}`).set(as(ALICE)).expect(200);
    await request(app).get(`/${BOB}`).set(as(ALICE)).expect(403);
  });

  it('lets a user change their own username', async () => {
    const res = await request(app).put(`/${ALICE}`).set(as(ALICE)).send({ username: 'alice2' }).expect(200);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(ALICE, { username: 'alice2' }, expect.anything());
    expect(res.body.user.username).toBe('alice2');
  });

  it('does not let a user make themselves admin', async () => {
    await request(app).put(`/${ALICE}`).set(as(ALICE)).send({ role: 'admin' }).expect(403);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('lets an admin change a role', async () => {
    await request(app).put(`/${BOB}`).set(as(ADMIN)).send({ role: 'admin' }).expect(200);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(BOB, { role: 'admin' }, expect.anything());
  });
});
