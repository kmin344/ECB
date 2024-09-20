const express = require('express');
const reviewRoutes = require('./routes/review.routes');
// const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.use('/', reviewRoutes);

// app.use(errorMiddleware);

module.exports = app;