const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public: shoppers browse the catalog without signing in.
router.get('/', productController.getAllProducts);
// Declared before /:productId so "related" isn't read as an ID.
router.get('/related', productController.getRelatedProducts);
router.get('/:productId', productController.getProductById);
router.post('/check-availability', productController.checkAvailability);

// Admin: only admins change the catalog.
router.post('/', verifyToken, requireAdmin, productController.createProduct);
router.put('/:productId', verifyToken, requireAdmin, productController.updateProduct);
router.delete('/:productId', verifyToken, requireAdmin, productController.deleteProduct);

module.exports = router;
