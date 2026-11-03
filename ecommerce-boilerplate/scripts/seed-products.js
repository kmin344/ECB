// Seeds a small demo catalog through the API gateway.
// Usage (stack running): npm run seed
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
  const id = Date.now();
  const credentials = { email: `seed-${id}@example.com`, password: `seed-${id}` };
  await axios.post(`${API}/api/auth/register`, { username: `seed-${id}`, ...credentials });
  const { data } = await axios.post(`${API}/api/auth/login`, credentials);
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
