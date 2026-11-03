const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = authMiddleware;

// Public
router.get('/product/:productId', reviewController.getReviewsForProduct);
router.get('/:id', reviewController.getReview);

// Signed-in users
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

// Admin
router.get('/', authMiddleware, requireAdmin, reviewController.listReviews);
router.patch('/:id/status', authMiddleware, requireAdmin, reviewController.updateReviewStatus);

module.exports = router;
