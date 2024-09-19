const axios = require('axios');
const Order = require('../models/order.model');

// Create and Save a new Order
exports.createOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);  // Add this line for debugging
    const { userId, products, totalAmount, shippingAddress } = req.body;

    const newOrder = new Order({
      userId,
      products,
      totalAmount,
      shippingAddress
    });

    console.log('New order object:', newOrder);  // Add this line for debugging

    const savedOrder = await newOrder.save();
    console.log('Saved order:', savedOrder);  // Add this line for debugging
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);  // Add this line for debugging
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Retrieve all Orders from the database
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email') // Populate user data
      .populate('products.product', 'name price'); // Populate product data
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
    const order = await Order.findById(req.params.orderId);
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
      message: "Error retrieving order with id " + req.params.orderId
    });
  }
};

// Update an Order identified by the orderId in the request
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, {
      userId: req.body.userId,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      status: req.body.status,
      shippingAddress: req.body.shippingAddress,
      updatedAt: Date.now()
    }, { new: true });

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