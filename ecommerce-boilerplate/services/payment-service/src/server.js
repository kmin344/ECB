const mongoose = require('mongoose');
const { buildApp } = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  logger.warn('STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is not set: checkout answers 503');
}

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/payment-service')
  .then(() => logger.info('MongoDB connected'))
  .catch((error) => {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  });

buildApp().listen(PORT, () => logger.info(`payment-service running on port ${PORT}`));
