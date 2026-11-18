// End-to-end smoke test through the API gateway.
// Start the stack first (docker compose up -d --build api-gateway), make an
// admin account (README, "First admin"), then:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run test:smoke
const axios = require('axios');

const API = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const client = axios.create({ baseURL: API, validateStatus: () => true });

let failures = 0;
function check(label, response, expectedStatus, predicate = () => true) {
  const ok = response.status === expectedStatus && predicate(response.data);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} (HTTP ${response.status})`);
  if (!ok) {
    failures += 1;
    console.log('      response:', JSON.stringify(response.data).slice(0, 300));
  }
  return ok;
}

async function main() {
  const id = Date.now();
  const credentials = { email: `smoke-${id}@example.com`, password: `smoke-${id}-pw` };

  // Auth
  const register = await client.post('/api/auth/register', { username: `smoke-${id}`, ...credentials });
  check('register a user', register, 201, (d) => typeof d.token === 'string');

  const login = await client.post('/api/auth/login', credentials);
  if (!check('log in', login, 200, (d) => d.token && d.user && d.user._id)) return;
  const userId = login.data.user._id;
  const headers = { Authorization: `Bearer ${login.data.token}` };

  const weak = await client.post('/api/auth/register', { username: `weak-${id}`, email: `weak-${id}@example.com`, password: 'short' });
  check('reject a short password', weak, 400);

  const adminLogin = await client.post('/api/auth/login', {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  if (!check('log in as admin (ADMIN_EMAIL, ADMIN_PASSWORD)', adminLogin, 200, (d) => d.token)) return;
  const adminHeaders = { Authorization: `Bearer ${adminLogin.data.token}` };

  // Products
  const customerCreate = await client.post(
    '/api/products',
    { name: 'Not allowed', description: 'x', thumbnail: 'x', price: 1, stock: 1, category: 'x' },
    { headers },
  );
  check('block customers from creating products', customerCreate, 403);

  const create = await client.post(
    '/api/products',
    {
      name: 'Smoke Test Product',
      description: 'Created by the smoke test',
      thumbnail: 'https://example.com/product.jpg',
      price: 9.99,
      stock: 10,
      category: 'Smoke Tests',
    },
    { headers: adminHeaders },
  );
  if (!check('create a product', create, 201, (d) => d._id && d.stock === 10)) return;
  const productId = create.data._id;

  const list = await client.get('/api/products');
  check('list products without signing in', list, 200, (d) => Array.isArray(d) && d.some((p) => p._id === productId));

  const update = await client.put(`/api/products/${productId}`, { stock: 15 }, { headers: adminHeaders });
  check('update only the stock', update, 200, (d) => d.stock === 15 && d.name === 'Smoke Test Product');

  const related = await client.get('/api/products/related', {
    params: { productId, category: 'Smoke Tests' },
  });
  check('get related products', related, 200, (d) => Array.isArray(d) && !d.some((p) => p._id === productId));

  const availability = await client.post(
    '/api/products/check-availability',
    { products: [{ productId, quantity: 5 }] },
  );
  check('check availability', availability, 200, (d) => d[0] && d[0].available === true);

  // Orders
  const order = await client.post(
    '/api/orders',
    {
      products: [{ product: productId, quantity: 2 }],
      totalAmount: 19.98,
      shippingAddress: '123 Test Street, Test City',
    },
    { headers },
  );
  if (!check('create an order', order, 201, (d) => d._id && d.user === userId)) return;

  const orders = await client.get(`/api/orders/user/${userId}`, { headers });
  check("list the user's orders", orders, 200, (d) => Array.isArray(d) && d.some((o) => o._id === order.data._id));

  const single = await client.get(`/api/orders/${order.data._id}`, { headers });
  check('get the order', single, 200, (d) => d._id === order.data._id);

  const allOrders = await client.get('/api/orders', { headers });
  check('block non-admins from listing every order', allOrders, 403);

  // Profile
  const profile = await client.put('/api/users/profile', { name: 'Smoke Tester' }, { headers });
  check('update own profile', profile, 200, (d) => d.name === 'Smoke Tester');

  // Cart
  const cart = await client.post('/api/carts/items', { productId, quantity: 1 }, { headers });
  check('add to cart', cart, 201, (d) => d.items && d.items.length === 1);

  // Auth is enforced through the gateway
  const anonymous = await client.get(`/api/orders/user/${userId}`);
  check('reject requests without a token', anonymous, 401);
}

main()
  .catch((error) => {
    console.error('Smoke test crashed:', error.message);
    failures += 1;
  })
  .finally(() => {
    if (failures > 0) {
      console.error(`\n${failures} check(s) failed`);
      process.exitCode = 1;
    } else {
      console.log('\nAll smoke checks passed');
    }
  });
