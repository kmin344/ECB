const connectDB = require('../config/database');
const User = require('../models/user.model');

connectDB();

async function createUser(userData) {
  try {
    const user = await User.findById(userData._id, '-password');
    await user.save();
    console.log({ message: 'User created successfully', userId: user });
  } catch (error) {
    console.log({ message: 'Error creating user', error: error.message });
  }
}

createUser({
  "__v": 0,
  "_id": "66eff4e47f3d061154a0f411",
  "createdAt": "2024-09-22T10:43:48.950Z",
  "email": "newuser@example.com633",
  "password": "$2a$10$SaPw1jThav.hClkFcS9eN.C31LBlGmRSagumtH280e6vyaNWj16Au",
  "role": "user",
  "username": "newuser633"
});