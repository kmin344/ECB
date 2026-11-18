const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json({ limit: '100kb' }));

app.use('/', require('./routes/auth.routes'));

module.exports = app;

if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/auth-service')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`auth-service running on port ${PORT}`));
}
