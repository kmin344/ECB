const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// Liveness: the process answers. Readiness: MongoDB is connected as well.
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ok: ready });
});

app.use('/', require('./routes/product.routes'));

module.exports = app;

if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/product-service')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
      // Exit so the container platform restarts the service.
      console.error('Could not connect to MongoDB', err.message);
      process.exit(1);
    });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`product-service running on port ${PORT}`));
}
