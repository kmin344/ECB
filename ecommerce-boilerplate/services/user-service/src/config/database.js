const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/auth-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;