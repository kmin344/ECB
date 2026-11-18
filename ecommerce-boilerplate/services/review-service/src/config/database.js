const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Stops the process when MongoDB cannot be reached at startup, so the
// container platform restarts it instead of serving errors.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/review-service');
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
