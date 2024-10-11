// order-service/scripts/seed.js

const mongoose = require('mongoose');
const { orders } = require('../data/seed-data');
const Order = require('./src/models/order');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Order.deleteMany({}); // Clear existing orders
    await Order.insertMany(orders);

    console.log('Order database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding order database:', error);
    process.exit(1);
  }
};

seedDatabase();