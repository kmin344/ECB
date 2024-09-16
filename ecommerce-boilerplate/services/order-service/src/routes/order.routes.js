const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Create a new order
router.post('/', orderController.createOrder);

// Retrieve all orders
router.get('/', orderController.getAllOrders);

// Retrieve a single order with orderId
router.get('/:orderId', orderController.getOrderById);

// Update an order with orderId
router.put('/:orderId', orderController.updateOrder);

// Delete an order with orderId
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;