const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { loadCurrentUser, requireAdmin, requireSelfOrAdmin } = require('../middleware/access.middleware');

const router = express.Router();

router.use(authMiddleware, loadCurrentUser);

// The signed-in user's own profile (declared before /:userId).
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Managing other accounts is admin-only.
router.post('/', requireAdmin, userController.createUser);
router.get('/', requireAdmin, userController.getAllUsers);
router.delete('/:userId', requireAdmin, userController.deleteUser);

// Users can read and edit their own account; admins can do this for anyone.
router.get('/:userId', requireSelfOrAdmin, userController.getUserById);
router.put('/:userId', requireSelfOrAdmin, userController.updateUser);
router.get('/:userId/profile-with-orders', requireSelfOrAdmin, userController.getUserProfileWithOrders);

module.exports = router;
