const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Define your schema here
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);