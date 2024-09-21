const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error(err.stack);

  // Determine the status code
  const statusCode = err.statusCode || 500;

  // Send the error response
  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;