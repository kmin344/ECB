const mongoose = require('mongoose');
const { users } = require('../data/seed-data');
const User = require('../src/models/user.model');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/auth-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await User.deleteMany({}); // Clear existing users
    await User.insertMany(users);

    console.log('Auth database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding auth database:', error);
    process.exit(1);
  }
};

seedDatabase();