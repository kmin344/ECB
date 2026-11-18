const express = require('express');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const reviewRoutes = require('./routes/review.routes');

const app = express();

app.use(express.json());

// Liveness: the process answers. Readiness: MongoDB is connected as well.
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ok: ready });
});

// Routes
app.use('/', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;