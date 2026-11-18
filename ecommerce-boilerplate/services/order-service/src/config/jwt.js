// The token secret is required. A missing secret stops the service at startup
// instead of falling back to a value that anyone could read in the source.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

// Only accept tokens signed the way auth-service signs them.
const VERIFY_OPTIONS = { algorithms: ['HS256'] };

module.exports = { JWT_SECRET, VERIFY_OPTIONS };
