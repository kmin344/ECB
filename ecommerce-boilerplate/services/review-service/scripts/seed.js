// review-service/scripts/seed.js

const mongoose = require('mongoose');
const { reviews } = require('../data/seed-data');
const Review = require('../src/models/review');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Review.deleteMany({}); // Clear existing reviews
    await Review.insertMany(reviews);

    console.log('Review database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding review database:', error);
    process.exit(1);
  }
};

seedDatabase();