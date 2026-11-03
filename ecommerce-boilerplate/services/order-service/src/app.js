const express = require('express');
const mongoose = require('mongoose');
const { verifyToken } = require('./middleware/auth');
// Import and register models
require('./models/user.model');
require('./models/product.model');
require('./models/order.model');

const app = express();

app.use(express.json());

app.use('/', verifyToken, require('./routes/order.routes'));

module.exports = app;

if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/order-service')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`order-service running on port ${PORT}`));
}
