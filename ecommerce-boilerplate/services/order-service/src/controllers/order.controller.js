const Order = require('../models/order.model');

// Create and Save a new Order
exports.createOrder = async (req, res) => {
  try {
    const { userId, products, totalAmount, shippingAddress } = req.body;

    // Check product availability
    const availabilityCheck = await axios.post('http://product-service:3000/api/products/check-availability', { products });
    const unavailableProducts = availabilityCheck.data.filter(item => !item.available);

    if (unavailableProducts.length > 0) {
      return res.status(400).json({ message: 'Some products are not available', unavailableProducts });
    }

    const order = new Order({
      userId,
      products,
      totalAmount,
      shippingAddress,
      status: 'pending'
    });

    const savedOrder = await order.save();
    res.status(201).send(savedOrder);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while creating the Order."
    });
  }
};

// Retrieve all Orders from the database
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.send(orders);
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