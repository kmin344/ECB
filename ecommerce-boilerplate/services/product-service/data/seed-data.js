// product-service/data/seed-data.js

const mongoose = require('mongoose');

const products = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Smartphone X',
    description: 'Latest model with advanced features',
    price: 999.99,
    category: 'Electronics',
    stock: 50
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Classic T-Shirt',
    description: 'Comfortable cotton t-shirt',
    price: 19.99,
    category: 'Clothing',
    stock: 100
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Gourmet Coffee Beans',
    description: 'Premium Arabica beans, medium roast',
    price: 14.99,
    category: 'Food & Beverage',
    stock: 30
  }
];

module.exports = { products };