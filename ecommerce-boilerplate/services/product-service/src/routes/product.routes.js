const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const stockController = require('../controllers/stock.controller');
const { verifyToken, requireAdmin, requireService } = require('../middleware/auth');

// Internal: order-service takes and returns stock. The gateway does not route
// /internal paths, and a service token is required as well.
router.post('/internal/reserve', verifyToken, requireService, stockController.reserve);
router.post('/internal/release', verifyToken, requireService, stockController.release);

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
