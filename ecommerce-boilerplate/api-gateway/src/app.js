const express = require('express');

const app = express();

app.use('/', require('./routes/route'));

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
