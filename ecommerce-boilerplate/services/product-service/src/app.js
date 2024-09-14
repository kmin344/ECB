const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://mongo:27017/product-service', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/', require('./routes/product.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`product-service running on port ${PORT}`));
