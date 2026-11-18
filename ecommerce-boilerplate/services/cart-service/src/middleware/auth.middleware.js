const jwt = require('jsonwebtoken');
const { JWT_SECRET, VERIFY_OPTIONS } = require('../config/jwt');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET, VERIFY_OPTIONS);
    req.user = { id: decodedToken.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};