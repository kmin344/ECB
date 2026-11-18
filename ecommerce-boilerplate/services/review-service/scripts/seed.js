const mongoose = require('mongoose');

// This script deletes the collection before it inserts demo data. Never run it on a live store.
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed: NODE_ENV is production');
  process.exit(1);
}
const { reviews } = require('../data/seed-data');
const Review = require('../src/models/review.model');

const seedDatabase = async () => {
  try {
    await mongoose.connect('mongodb://mongo:27017/review_db', {
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