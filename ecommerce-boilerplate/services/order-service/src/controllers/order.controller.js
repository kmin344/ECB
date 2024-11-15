const Order = require('../models/order.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create and Save a new Order
exports.createOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);
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
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Retrieve all Orders from the database
exports.getAllOrders = async (req, res) => {
  try {
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
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate('products.product', 'name price');
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
      user: req.body.user,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      status: req.body.status,
      shippingAddress: req.body.shippingAddress
    }, { new: true })
      .populate('user', 'name email')
      .populate('products.product', 'name price');

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