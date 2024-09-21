const express = require('express');
const paymentRoutes = require('./routes/payment.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.use('/api/payments', paymentRoutes);

app.use(errorMiddleware);

module.exports = app;