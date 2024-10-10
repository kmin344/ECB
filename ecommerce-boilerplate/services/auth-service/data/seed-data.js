// auth-service/data/seed-data.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const users = [
  {
    _id: new mongoose.Types.ObjectId(),
    username: 'john_doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'customer'
  },
  {
    _id: new mongoose.Types.ObjectId(),
    username: 'jane_smith',
    email: 'jane@example.com',
    password: bcrypt.hashSync('password456', 10),
    role: 'customer'
  },
  {
    _id: new mongoose.Types.ObjectId(),
    username: 'admin_user',
    email: 'admin@example.com',
    password: bcrypt.hashSync('adminpass789', 10),
    role: 'admin'
  }
];

module.exports = { users };