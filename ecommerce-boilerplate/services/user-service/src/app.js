const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
// const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

// Liveness: the process answers. Readiness: MongoDB is connected as well.
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ok: ready });
});

app.use('/', userRoutes);

// app.use(errorMiddleware);

module.exports = app;