const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, reviewController.create);
router.get('/', reviewController.getAll);
router.get('/:id', reviewController.getById);
router.put('/:id', authMiddleware, reviewController.update);
router.delete('/:id', authMiddleware, reviewController.delete);

module.exports = router;