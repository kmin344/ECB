const logger = require('../utils/logger');

// Logs every error. Clients get the message only for their own mistakes (4xx);
// server errors get a generic message so driver and stack details stay in the logs.
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(err.stack || String(err));

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: statusCode < 500 ? err.message : 'Internal Server Error',
  });
};

module.exports = errorMiddleware;
