const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Create a new product
router.post('/', productController.createProduct);

// Retrieve all products
router.get('/', productController.getAllProducts);

// Products in the same category, used on the product page.
// Declared before /:productId so "related" isn't read as an ID.
router.get('/related', productController.getRelatedProducts);

// Retrieve a single product with productId
router.get('/:productId', productController.getProductById);

// Update a product with productId
router.put('/:productId', productController.updateProduct);

// Delete a product with productId
router.delete('/:productId', productController.deleteProduct);

router.post('/check-availability', productController.checkAvailability);

module.exports = router;