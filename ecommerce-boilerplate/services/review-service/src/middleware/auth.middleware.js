const jwt = require('jsonwebtoken');
const { JWT_SECRET, VERIFY_OPTIONS } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET, VERIFY_OPTIONS);
    req.user = { id: decodedToken.userId, role: decodedToken.role || 'user' };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin role comes from the token, which auth-service signs at login.
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = authMiddleware;
module.exports.requireAdmin = requireAdmin;
