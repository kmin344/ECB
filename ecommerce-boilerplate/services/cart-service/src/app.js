const express = require('express');
const cartRoutes = require('./routes/cart.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.use('/', cartRoutes);

app.use(errorMiddleware);

module.exports = app;