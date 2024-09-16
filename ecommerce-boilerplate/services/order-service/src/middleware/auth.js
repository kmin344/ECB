const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Auth Header:', authHeader);  // Add this line for debugging

  if (!authHeader) {
    return res.status(401).json({ message: 'No auth header, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    console.log('Decoded token:', decoded);  // Add this line for debugging
    next();
  } catch (error) {
    console.error('Token verification error:', error);  // Add this line for debugging
    res.status(401).json({ message: 'Token is not valid' });
  }
};