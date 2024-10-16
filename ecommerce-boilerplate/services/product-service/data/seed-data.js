// product-service/data/seed-data.js

const mongoose = require('mongoose');

const products = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Smartphone X',
    thumbnail: 'https://example.com/smartphone-x-thumb.jpg',
    images: [
      'https://example.com/smartphone-x-1.jpg',
      'https://example.com/smartphone-x-2.jpg'
    ],
    description: 'Latest model with advanced features',
    price: 999.99,
    category: 'Electronics',
    inStock: true,
    stock: 50,
    averageRating: 0,
    numberOfRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Classic T-Shirt',
    thumbnail: 'https://example.com/classic-tshirt-thumb.jpg',
    images: [
      'https://example.com/classic-tshirt-1.jpg',
      'https://example.com/classic-tshirt-2.jpg'
    ],
    description: 'Comfortable cotton t-shirt',
    price: 19.99,
    category: 'Clothing',
    inStock: true,
    stock: 100,
    averageRating: 0,
    numberOfRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Gourmet Coffee Beans',
    thumbnail: 'https://example.com/coffee-beans-thumb.jpg',
    images: [
      'https://example.com/coffee-beans-1.jpg',
      'https://example.com/coffee-beans-2.jpg'
    ],
    description: 'Premium Arabica beans, medium roast',
    price: 14.99,
    category: 'Food & Beverage',
    inStock: true,
    stock: 30,
    averageRating: 0,
    numberOfRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = { products };