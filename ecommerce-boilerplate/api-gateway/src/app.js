const express = require('express');
const { rateLimit } = require('express-rate-limit');

const app = express();

// The gateway runs behind nginx (or a cloud load balancer), so the client IP
// comes from X-Forwarded-For. TRUST_PROXY is the number of proxies in front.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));

// Slows down password guessing and account spam. Counted per client IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT ?? 20),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts, try again later' },
});
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/', require('./routes/route'));

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Not Found');
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
}
