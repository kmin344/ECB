// review-service/data/seed-data.js

const mongoose = require('mongoose');

const reviews = [
  {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(), // You'll need to replace this with actual user IDs
    product: new mongoose.Types.ObjectId(), // Replace with actual product IDs
    rating: 5,
    comment: 'Excellent smartphone, very satisfied!'
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(), // You'll need to replace this with actual user IDs
    product: new mongoose.Types.ObjectId(), // Replace with actual product IDs
    rating: 4,
    comment: 'Good quality t-shirt, but sizing runs small'
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(), // You'll need to replace this with actual user IDs
    product: new mongoose.Types.ObjectId(), // Replace with actual product IDs
    rating: 5,
    comment: "Best coffee I've ever tasted!"
  }
];

module.exports = { reviews };