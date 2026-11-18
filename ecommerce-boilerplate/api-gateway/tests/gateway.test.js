// The auth rate limit runs before the proxy. Backends point at a closed port,
// so a request that passes the limiter fails fast with a proxy error.
process.env.AUTH_RATE_LIMIT = '3';
process.env.AUTH_SERVICE_URL = 'http://127.0.0.1:9';
process.env.PRODUCT_SERVICE_URL = 'http://127.0.0.1:9';

const request = require('supertest');
const app = require('../src/app');

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

it('answers the health check without calling a backend', async () => {
  await request(app).get('/health').expect(200, { ok: true });
});

it('limits login attempts per client IP', async () => {
  const from = (ip) => request(app).post('/api/auth/login').set('X-Forwarded-For', ip).send({});

  for (let i = 0; i < 3; i += 1) {
    const res = await from('203.0.113.7');
    expect(res.status).not.toBe(429);
  }
  const blocked = await from('203.0.113.7');
  expect(blocked.status).toBe(429);
  expect(blocked.body).toEqual({ message: 'Too many attempts, try again later' });

  // Another client is not affected.
  expect((await from('198.51.100.1')).status).not.toBe(429);
});

it('does not limit catalog reads', async () => {
  for (let i = 0; i < 5; i += 1) {
    const res = await request(app).get('/api/products').set('X-Forwarded-For', '203.0.113.7');
    expect(res.status).not.toBe(429);
  }
});

it.each([
  '/api/products/internal/reserve',
  '/api/products/INTERNAL/release',
  '/api/products//internal/reserve',
  '/api/orders/internal',
])('does not route the internal path %s', async (path) => {
  const res = await request(app).post(path).send({});
  expect(res.status).toBe(404);
  expect(res.text).toBe('Not Found');
});
