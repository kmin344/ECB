const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  images: {
    type: Array,
    default: []
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  category: { 
    type: String, 
    required: true 
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  stock: { type: Number, required: true, default: 0 },
  averageRating: { type: Number, default: 0 },
  numberOfRatings: { type: Number, default: 0 },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Product', productSchema);