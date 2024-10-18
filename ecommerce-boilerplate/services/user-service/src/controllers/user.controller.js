const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const axios = require('axios');

const API_URL = process.env.REACT_APP_API_URL || 'http://order-service:3000';

const api = axios.create({
  baseURL: API_URL,
});

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).send({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    res.status(500).send({ message: 'Error creating user', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching users', error: error.message });
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
    res.status(500).send({ message: 'Error fetching user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, { name, email, role }, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).send({ message: 'Error updating user', error: error.message });
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
    res.status(500).send({ message: 'Error deleting user', error: error.message });
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
    console.log('Fetching user profile', userId);
    const user = await User.findById(userId, '-password');
    console.log('User:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch user's orders from order-service
    let orders;
    try {
      const orderServiceResponse = await api.get(`orders/${userId}`, {
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
    res.status(500).json({ message: 'Error fetching user profile and orders', error: error.message });
  }
};
