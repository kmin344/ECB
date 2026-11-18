const winston = require('winston');

// Logs go to stdout only: containers collect stdout, and the app folder is read-only.
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
