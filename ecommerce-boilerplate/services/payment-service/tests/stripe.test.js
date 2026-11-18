const crypto = require('crypto');
const { createClient, verifySignature, toMinorUnits, formEncode } = require('../src/lib/stripe');

describe('verifySignature', () => {
  const body = Buffer.from('{"id":"evt_1"}');
  const now = 1_800_000_000_000;
  const t = now / 1000;
  const sign = (secret, ts = t, payload = body) =>
    crypto.createHmac('sha256', secret).update(`${ts}.`).update(payload).digest('hex');

  it('accepts a matching signature', () => {
    expect(verifySignature(body, `t=${t},v1=${sign('whsec')}`, 'whsec', now)).toBe(true);
  });

  it('accepts any matching v1 (secret rotation)', () => {
    expect(verifySignature(body, `t=${t},v1=${sign('old')},v1=${sign('whsec')}`, 'whsec', now)).toBe(true);
  });

  it('rejects a changed body, another secret, an old timestamp and junk', () => {
    expect(verifySignature(Buffer.from('{"id":"evt_2"}'), `t=${t},v1=${sign('whsec')}`, 'whsec', now)).toBe(false);
    expect(verifySignature(body, `t=${t},v1=${sign('other')}`, 'whsec', now)).toBe(false);
    expect(verifySignature(body, `t=${t - 301},v1=${sign('whsec', t - 301)}`, 'whsec', now)).toBe(false);
    expect(verifySignature(body, 'nonsense', 'whsec', now)).toBe(false);
    expect(verifySignature(body, undefined, 'whsec', now)).toBe(false);
    expect(verifySignature(body, `t=${t},v1=${sign('whsec')}`, undefined, now)).toBe(false);
  });
});

it('converts prices to Stripe units', () => {
  expect(toMinorUnits(19.99, 'usd')).toBe(1999);
  expect(toMinorUnits(0.29, 'eur')).toBe(29); // 0.29 * 100 = 28.999999999999996
  expect(toMinorUnits(39000, 'krw')).toBe(39000);
});

it('form-encodes nested parameters the way Stripe expects', () => {
  const encoded = formEncode({ mode: 'payment', line_items: [{ quantity: 2, price_data: { currency: 'usd' } }], skip: undefined });
  expect(decodeURIComponent(encoded.toString())).toBe('mode=payment&line_items[0][quantity]=2&line_items[0][price_data][currency]=usd');
});

it('sends the secret key and idempotency key, and reports Stripe errors', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'cs_1' }) })
    .mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: { message: 'No such price' } }) });
  const stripe = createClient({ secretKey: 'sk_test_1', fetchImpl });

  await expect(stripe.createCheckoutSession({ mode: 'payment' }, 'key-1')).resolves.toEqual({ id: 'cs_1' });
  const [url, init] = fetchImpl.mock.calls[0];
  expect(url).toBe('https://api.stripe.com/v1/checkout/sessions');
  expect(init.headers).toMatchObject({ authorization: 'Bearer sk_test_1', 'idempotency-key': 'key-1' });
  expect(init.body).toBe('mode=payment');

  await expect(stripe.refund('pi_1')).rejects.toMatchObject({ name: 'StripeError', status: 400, message: 'No such price' });
});
