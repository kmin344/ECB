// order-service/data/seed-data.js

const mongoose = require('mongoose');

// We'll use the user and product IDs from the other services
const userIds = {
  john: '670fad196f59863e18429e6f',
  jane: new mongoose.Types.ObjectId()
};

const productIds = {
  smartphone: new mongoose.Types.ObjectId(),
  tshirt: new mongoose.Types.ObjectId(),
  coffee: new mongoose.Types.ObjectId()
};

const orders = [
  {
    _id: new mongoose.Types.ObjectId(),
    user: userIds.john,
    products: [
      { product: productIds.smartphone, quantity: 1 },
      { product: productIds.coffee, quantity: 2 }
    ],
    totalAmount: 1029.97,
    status: 'delivered',
    shippingAddress: '123 Main St, Anytown, AN 12345',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user: userIds.jane,
    products: [
      { product: productIds.tshirt, quantity: 3 }
    ],
    totalAmount: 59.97,
    status: 'processing',
    shippingAddress: '456 Oak Rd, Other City, OC 67890',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = { orders, userIds, productIds };