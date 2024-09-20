const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true
  },
  price: { 
    type: Number, 
    required: true
  }
  // Add other fields that are necessary for the Order service
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);