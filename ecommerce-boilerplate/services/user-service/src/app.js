const express = require('express');
const userRoutes = require('./routes/user.routes');
// const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.use('/', userRoutes);

// app.use(errorMiddleware);

module.exports = app;