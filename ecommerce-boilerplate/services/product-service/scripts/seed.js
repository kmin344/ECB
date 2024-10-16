const mongoose = require('mongoose');
const { products } = require('../data/seed-data');
const Product = require('./src/models/product.model');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
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