const User = require('../models/user.model');
const mongoose = require('mongoose');
const axios = require('axios');

const API_URL = process.env.REACT_APP_API_URL || 'http://order-service:3000';

const api = axios.create({
  baseURL: API_URL,
});

exports.createUser = async (req, res) => {
  try {
    // The model hashes the password in its pre-save hook.
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role });
    await user.save();
    res.status(201).send({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: error.message });
    }
    console.error(error);
    res.status(500).send({ message: 'Error creating user' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, '-password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const changes = {};
    if (username !== undefined) changes.username = username;
    if (email !== undefined) changes.email = email;
    if (role !== undefined) {
      if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Only admins can change roles' });
      }
      changes.role = role;
    }
    const user = await User.findByIdAndUpdate(req.params.userId, changes, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error deleting user' });
  }
};

exports.getUserProfileWithOrders = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Fetch user profile
    const user = await User.findById(userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch user's orders from order-service
    let orders;
    try {
      const orderServiceResponse = await api.get(`/user/${userId}`, {
        headers: {
          Authorization: req.headers.authorization
        }
      });
      orders = orderServiceResponse.data;
    } catch (orderError) {
      console.error('Error fetching orders:', orderError);
      orders = { error: 'Unable to fetch orders at this time' };
    }

    // Combine user profile with orders
    const userProfileWithOrders = {
      ...user.toObject(),
      orders
    };

    res.status(200).json(userProfileWithOrders);
  } catch (error) {
    console.error('Error in getUserProfileWithOrders:', error);
    res.status(500).json({ message: 'Error fetching user profile and orders' });
  }
};

// The signed-in user's own profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, '-password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const changes = {};
    for (const field of ['name', 'email', 'phone', 'address']) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }
    const user = await User.findByIdAndUpdate(req.user.id, changes, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: error.message });
    }
    console.error(error);
    res.status(500).send({ message: 'Error updating profile' });
  }
};
