const Order = require('../models/order.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create and Save a new Order
exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body;

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);

    const newOrder = new Order({
      user: decodedToken.userId,
      products,
      totalAmount,
      shippingAddress
    });


    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Retrieve all Orders from the database
const canAccess = (req, ownerId) => req.userRole === 'admin' || String(ownerId) === String(req.userId);

// Admin: every order, newest first
exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    if (!canAccess(req, req.params.userId)) {
      return res.status(403).json({ message: 'You can only view your own orders' });
    }
    // const user = await UserActivation.findById(req.userId);
    // if (!user) {
    //   return res.status(404).send({
    //     message: "User not found with id " + req.userId
    //   });
    // }

    const orders = await Order.find({
      user: req.params.userId
    })


      // .populate('user', 'name email') // Populate user data
      // .populate('products.product', 'name price'); // Populate product data
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving orders."
    });
  }
};

// Find a single Order with an orderId
exports.getOrderById = async (req, res) => {
  try {
    // Users and products live in other services' databases, so the order
    // returns their IDs rather than populated documents.
    const order = await Order.findById(req.params.orderId);
    if (!order || !canAccess(req, order.user)) {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    res.send(order);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    return res.status(500).send({
      message: "Error retrieving order with id " + req.params.orderId
    });
  }
};

// Update an Order identified by the orderId in the request
exports.updateOrder = async (req, res) => {
  try {
    const changes = {};
    for (const field of ['products', 'totalAmount', 'status', 'shippingAddress']) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }
    changes.updatedAt = Date.now();
    const order = await Order.findByIdAndUpdate(req.params.orderId, changes, { new: true, runValidators: true });

    if (!order) {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    res.send(order);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    return res.status(500).send({
      message: "Error updating order with id " + req.params.orderId
    });
  }
};

// Delete an Order with the specified orderId in the request
// Admin: change only the status (used by the admin dashboard)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: req.body.status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found with id ' + req.params.orderId });
    }
    res.json(order);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    if (!order) {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    res.send({ message: "Order deleted successfully!" });
  } catch (error) {
    if (error.kind === 'ObjectId' || error.name === 'NotFound') {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    return res.status(500).send({
      message: "Could not delete order with id " + req.params.orderId
    });
  }
};