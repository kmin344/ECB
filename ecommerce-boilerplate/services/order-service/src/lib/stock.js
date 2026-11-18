const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3000';
const TIMEOUT_MS = Number(process.env.SERVICE_TIMEOUT_MS || 5000);

// A short-lived token that proves the caller is a service holding the shared secret.
const serviceToken = () =>
  jwt.sign({ role: 'service', service: 'order-service' }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1m' });

class StockError extends Error {
  constructor(status, body) {
    super(body?.message || `product-service answered ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function call(path, items) {
  const res = await fetch(`${PRODUCT_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${serviceToken()}` },
    body: JSON.stringify({ items }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new StockError(res.status, body);
  return body;
}

// Takes stock for all items or none. Resolves to [{ productId, quantity, name, price }].
exports.reserve = async (items) => (await call('/internal/reserve', items)).items;

// Gives stock back.
exports.release = async (items) => {
  await call('/internal/release', items);
};

exports.StockError = StockError;
