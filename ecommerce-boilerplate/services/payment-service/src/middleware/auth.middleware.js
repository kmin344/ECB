const jwt = require('jsonwebtoken');
const { JWT_SECRET, VERIFY_OPTIONS } = require('../config/jwt');

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET, VERIFY_OPTIONS);
    req.user = { id: decoded.userId, role: decoded.role || 'user' };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
