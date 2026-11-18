// Seeds a small demo catalog through the API gateway. Only admins can create
// products, so the script logs in with an admin account (see README, "First admin").
// Usage (stack running): ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed
const axios = require('axios');

const API = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const image = 'https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg';

const products = [
  { name: 'Best Seller 1', price: 39000 },
  { name: 'Best Seller 2', price: 49000 },
  { name: 'Best Seller 3', price: 44000 },
  { name: 'Best Seller 4', price: 52000 },
];

async function getToken() {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD to an admin account');
  }
  const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
  return data.token;
}

async function main() {
  const headers = { Authorization: `Bearer ${await getToken()}` };
  const created = await Promise.all(
    products.map(({ name, price }) =>
      axios.post(
        `${API}/api/products`,
        {
          name,
          price,
          description: `Demo product: ${name}`,
          stock: 10,
          category: 'Best Sellers',
          thumbnail: image,
          images: [image],
        },
        { headers },
      ),
    ),
  );
  console.log(`Created ${created.length} products`);
}

main().catch((error) => {
  console.error('Seeding failed:', error.response ? error.response.data : error.message);
  process.exitCode = 1;
});
