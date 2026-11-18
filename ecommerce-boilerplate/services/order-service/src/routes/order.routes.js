const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, requireAdmin, requireService } = require('../middleware/auth');

router.use(verifyToken);

// Internal: payment-service reads orders and reports payments. The gateway
// does not route /internal paths, and a service token is required as well.
router.get('/internal/orders/:orderId', requireService, orderController.getOrderForService);
router.post('/internal/orders/:orderId/paid', requireService, orderController.markPaid);

// Customers
router.post('/', orderController.createOrder);
router.get('/user/:userId', orderController.getAllOrders); // own orders (or any, for admins)
router.get('/:orderId', orderController.getOrderById); // own order (or any, for admins)
router.post('/:orderId/cancel', orderController.cancelOrder); // own pending order

// Admin
router.get('/', requireAdmin, orderController.listOrders);
router.patch('/:orderId/status', requireAdmin, orderController.updateOrderStatus);
router.put('/:orderId', requireAdmin, orderController.updateOrder); // shipping address only
router.delete('/:orderId', requireAdmin, orderController.deleteOrder); // cancelled orders only

module.exports = router;
