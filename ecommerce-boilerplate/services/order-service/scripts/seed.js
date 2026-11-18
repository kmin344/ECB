const mongoose = require('mongoose');

// This script deletes the collection before it inserts demo data. Never run it on a live store.
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed: NODE_ENV is production');
  process.exit(1);
}
const { orders } = require('../data/seed-data');
const Order = require('../src/models/order.model');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/order-service', {
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