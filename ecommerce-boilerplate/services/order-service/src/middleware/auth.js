const jwt = require('jsonwebtoken');
const { JWT_SECRET, VERIFY_OPTIONS } = require('../config/jwt');

exports.verifyToken = (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, VERIFY_OPTIONS);
    req.userId = decoded.userId;
    req.userRole = decoded.role || 'user';
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin role comes from the token, which auth-service signs at login.
exports.requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Service tokens are signed by other services with the shared secret and
// carry role "service". auth-service never puts that role in a user token.
exports.requireService = (req, res, next) => {
  if (req.userRole !== 'service') {
    return res.status(403).json({ message: 'Service access required' });
  }
  next();
};
