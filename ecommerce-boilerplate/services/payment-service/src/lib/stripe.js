// Minimal Stripe client over the REST API (no SDK): Checkout Sessions, refunds,
// and webhook signature checks. Docs: https://docs.stripe.com/api
const crypto = require('crypto');

const API = process.env.STRIPE_API_URL || 'https://api.stripe.com/v1';
const TOLERANCE_SECONDS = 300;

// Currencies that Stripe counts in whole units (no cents).
const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

class StripeError extends Error {
  constructor(status, body) {
    super(body?.error?.message || `Stripe answered ${status}`);
    this.name = 'StripeError';
    this.status = status;
  }
}

// Price in the store's units (for example 19.99 USD) -> Stripe's smallest unit (1999).
const toMinorUnits = (amount, currency) =>
  ZERO_DECIMAL.has(currency) ? Math.round(amount) : Math.round(amount * 100);

// Stripe takes form encoding with bracketed keys: line_items[0][price_data][currency]=usd
function formEncode(value, prefix, out = new URLSearchParams()) {
  if (value === undefined || value === null) return out;
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      formEncode(child, prefix ? `${prefix}[${key}]` : key, out);
    }
  } else {
    out.append(prefix, String(value));
  }
  return out;
}

function createClient({ secretKey, fetchImpl = fetch }) {
  async function post(path, params, idempotencyKey) {
    const res = await fetchImpl(`${API}${path}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${secretKey}`,
        'content-type': 'application/x-www-form-urlencoded',
        ...(idempotencyKey && { 'idempotency-key': idempotencyKey }),
      },
      body: formEncode(params).toString(),
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new StripeError(res.status, body);
    return body;
  }

  return {
    createCheckoutSession: (params, idempotencyKey) => post('/checkout/sessions', params, idempotencyKey),
    refund: (paymentIntentId, idempotencyKey) => post('/refunds', { payment_intent: paymentIntentId }, idempotencyKey),
  };
}

// Checks the Stripe-Signature header ("t=...,v1=...") against the raw request body.
// Returns true only for a matching signature made within the last 5 minutes.
function verifySignature(rawBody, header, secret, now = Date.now()) {
  if (!header || !secret || !Buffer.isBuffer(rawBody)) return false;
  let timestamp;
  const signatures = [];
  for (const part of header.split(',')) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = Number(value);
    if (key === 'v1' && value) signatures.push(value);
  }
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(now / 1000 - timestamp) > TOLERANCE_SECONDS) return false;

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.`).update(rawBody).digest();
  return signatures.some((sig) => {
    const given = Buffer.from(sig, 'hex');
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
}

module.exports = { createClient, verifySignature, toMinorUnits, formEncode, StripeError };
