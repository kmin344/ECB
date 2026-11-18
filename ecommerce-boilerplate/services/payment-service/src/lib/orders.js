// Calls order-service's internal routes with a short-lived service token.
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3000';
const TIMEOUT_MS = Number(process.env.SERVICE_TIMEOUT_MS || 5000);

const serviceToken = () =>
  jwt.sign({ role: 'service', service: 'payment-service' }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1m' });

class OrderServiceError extends Error {
  constructor(status, body) {
    super(body?.message || `order-service answered ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function call(method, path) {
  const res = await fetch(`${ORDER_SERVICE_URL}${path}`, {
    method,
    headers: { authorization: `Bearer ${serviceToken()}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new OrderServiceError(res.status, body);
  return body;
}

exports.getOrder = (orderId) => call('GET', `/internal/orders/${encodeURIComponent(orderId)}`);
exports.markPaid = (orderId) => call('POST', `/internal/orders/${encodeURIComponent(orderId)}/paid`);
exports.OrderServiceError = OrderServiceError;
