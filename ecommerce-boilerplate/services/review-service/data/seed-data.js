// review-service/data/seed-data.js

const mongoose = require('mongoose');

// We'll use the user and product IDs from the other services
const userIds = {
  john: new mongoose.Types.ObjectId(),
  jane: new mongoose.Types.ObjectId()
};

const productIds = {
  smartphone: new mongoose.Types.ObjectId(),
  tshirt: new mongoose.Types.ObjectId(),
  coffee: new mongoose.Types.ObjectId()
};

const reviews = [
  {
    _id: new mongoose.Types.ObjectId(),
    productId: productIds.smartphone,
    userId: userIds.john,
    rating: 5,
    comment: 'Excellent smartphone, very satisfied!',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    productId: productIds.tshirt,
    userId: userIds.jane,
    rating: 4,
    comment: 'Good quality t-shirt, but sizing runs small',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    productId: productIds.coffee,
    userId: userIds.john,
    rating: 5,
    comment: "Best coffee I've ever tasted!",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = { reviews, userIds, productIds };