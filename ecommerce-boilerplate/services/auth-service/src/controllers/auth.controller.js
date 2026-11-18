const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '1d';

// Request fields must be plain strings. An object such as { "$ne": null }
// would otherwise reach MongoDB as a query operator.
const isString = (value, min, max) => typeof value === 'string' && value.length >= min && value.length <= max;

const signToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { algorithm: 'HS256', expiresIn: TOKEN_TTL });

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!isString(username, 3, 50)) {
      return res.status(400).json({ message: 'username must be 3 to 50 characters' });
    }
    if (!isString(email, 3, 254) || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'email is not valid' });
    }
    if (!isString(password, 8, 128)) {
      return res.status(400).json({ message: 'password must be 8 to 128 characters' });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // role is never taken from the request: new accounts are always customers.
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ token: signToken(user) });
  } catch (error) {
    if (error.code === 11000) {
      // A concurrent registration won the unique index.
      return res.status(400).json({ message: 'User already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error in registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isString(email, 1, 254) || !isString(password, 1, 128)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ token: signToken(user), user: { _id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error in logging in' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error in getting current user' });
  }
};
