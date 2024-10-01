const express = require('express');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const reviewRoutes = require('./routes/review.routes');

const app = express();

app.use(express.json());

// Routes
app.use('/', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;