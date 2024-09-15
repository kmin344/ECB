const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../../../shared/middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;