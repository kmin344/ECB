const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true
  },
  email: { 
    type: String, 
    required: true
  }
  // Add other fields that are necessary for the Order service
  // Avoid including sensitive information like passwords
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);