const mongoose = require('mongoose');

// This script deletes the collection before it inserts demo data. Never run it on a live store.
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed: NODE_ENV is production');
  process.exit(1);
}
const { products } = require('../data/seed-data');
const Product = require('../src/models/product.model');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/product-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Product.deleteMany({}); // Clear existing products
    await Product.insertMany(products);

    console.log('Product database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding product database:', error);
    process.exit(1);
  }
};

seedDatabase();