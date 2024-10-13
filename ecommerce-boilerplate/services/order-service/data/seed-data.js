const mongoose = require('mongoose');

const orders = [
  {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(), // You'll need to replace this with actual user IDs
    products: [
      { product: new mongoose.Types.ObjectId(), quantity: 1 }, // Replace with actual product IDs
      { product: new mongoose.Types.ObjectId(), quantity: 2 }
    ],
    totalAmount: 1029.97,
    status: 'Completed'
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(), // You'll need to replace this with actual user IDs
    products: [
      { product: new mongoose.Types.ObjectId(), quantity: 3 } // Replace with actual product IDs
    ],
    totalAmount: 59.97,
    status: 'Processing'
  }
];

module.exports = { orders };