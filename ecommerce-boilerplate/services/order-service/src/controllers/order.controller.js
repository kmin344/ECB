const mongoose = require('mongoose');
const Order = require('../models/order.model');
const stock = require('../lib/stock');

const MAX_LINES = 50;
const MAX_QUANTITY = 1000;

// Allowed status changes. Cancelled and delivered orders are final.
const NEXT_STATUS = {
  pending: ['processing', 'shipped', 'delivered', 'cancelled'],
  processing: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const canAccess = (req, ownerId) => req.userRole === 'admin' || String(ownerId) === String(req.userId);
const lineItems = (order) => order.products.map((p) => ({ productId: String(p.product), quantity: p.quantity }));
const notFound = (res, orderId) => res.status(404).json({ message: 'Order not found with id ' + orderId });

// Turns the request lines into [{ productId, quantity }], adding up repeated products.
// Returns { items } or { error }.
function parseLines(products) {
  if (!Array.isArray(products) || products.length === 0 || products.length > MAX_LINES) {
    return { error: `products must be a list of 1 to ${MAX_LINES} lines` };
  }
  const quantities = new Map();
  for (const line of products) {
    const productId = line && typeof line.product === 'string' ? line.product : null;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return { error: 'each line needs a valid product id' };
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return { error: 'quantity must be a whole number of at least 1' };
    }
    quantities.set(productId, (quantities.get(productId) || 0) + line.quantity);
  }
  const items = [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
  if (items.some((i) => i.quantity > MAX_QUANTITY)) {
    return { error: `quantity must be at most ${MAX_QUANTITY} per product` };
  }
  return { items };
}

// Gives stock back and logs instead of failing: the order change has already happened.
async function releaseOrLog(order) {
  try {
    await stock.release(lineItems(order));
  } catch (error) {
    console.error(`Stock was not returned for order ${order._id}; return it by hand`, lineItems(order), error);
  }
}

// Places an order for the signed-in user. Prices come from product-service and
// stock is taken before the order is saved; the client's totals are ignored.
exports.createOrder = async (req, res) => {
  const { products, shippingAddress } = req.body || {};

  const address = typeof shippingAddress === 'string' ? shippingAddress.trim() : '';
  if (address.length < 5 || address.length > 500) {
    return res.status(400).json({ message: 'shippingAddress must be 5 to 500 characters' });
  }
  const { items, error } = parseLines(products);
  if (error) return res.status(400).json({ message: error });

  let reserved;
  try {
    reserved = await stock.reserve(items);
  } catch (err) {
    if (err instanceof stock.StockError && [400, 404, 409].includes(err.status)) {
      return res.status(err.status).json({ message: err.message, productId: err.body?.productId });
    }
    console.error('Could not reserve stock', err);
    return res.status(502).json({ message: 'The catalog is not available, try again later' });
  }

  // Sum in cents so 0.1 + 0.2 does not produce 0.30000000000000004.
  const totalCents = reserved.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);

  try {
    const order = await Order.create({
      user: req.userId, // set by verifyToken
      products: reserved.map((i) => ({ product: i.productId, quantity: i.quantity, name: i.name, price: i.price })),
      totalAmount: totalCents / 100,
      shippingAddress: address,
    });
    res.status(201).json(order);
  } catch (err) {
    console.error('Could not save order', err);
    await releaseOrLog({ _id: 'unsaved', products: reserved.map((i) => ({ product: i.productId, quantity: i.quantity })) });
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Admin: every order, newest first
exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving orders' });
  }
};

// A user's orders (their own, or anyone's for admins)
exports.getAllOrders = async (req, res) => {
  try {
    if (!canAccess(req, req.params.userId)) {
      return res.status(403).json({ message: 'You can only view your own orders' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Some error occurred while retrieving orders.' });
  }
};

// Find a single Order with an orderId
exports.getOrderById = async (req, res) => {
  try {
    // Users and products live in other services' databases, so the order
    // returns their IDs rather than populated documents.
    const order = mongoose.Types.ObjectId.isValid(req.params.orderId) ? await Order.findById(req.params.orderId) : null;
    if (!order || !canAccess(req, order.user)) {
      return notFound(res, req.params.orderId);
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving order with id ' + req.params.orderId });
  }
};

// Moves an order to a new status if the rules allow it. Cancelling returns the
// stock exactly once: the status update only matches the status we read, so a
// second, concurrent cancel finds no match and returns no stock.
async function changeStatus(order, status) {
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { status, updatedAt: Date.now() },
    { new: true },
  );
  if (updated && status === 'cancelled') await releaseOrLog(updated);
  return updated;
}

// Admin: change the status (used by the admin dashboard)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!Object.hasOwn(NEXT_STATUS, status)) {
      return res.status(400).json({ message: `status must be one of: ${Object.keys(NEXT_STATUS).join(', ')}` });
    }
    const order = mongoose.Types.ObjectId.isValid(req.params.orderId) ? await Order.findById(req.params.orderId) : null;
    if (!order) return notFound(res, req.params.orderId);
    if (order.status === status) return res.json(order);
    if (!NEXT_STATUS[order.status].includes(status)) {
      return res.status(409).json({ message: `An order that is ${order.status} cannot become ${status}` });
    }

    const updated = await changeStatus(order, status);
    if (!updated) return res.status(409).json({ message: 'The order changed at the same time, reload and try again' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

// Customer: cancel an own order that is still pending (not paid or shipped).
exports.cancelOrder = async (req, res) => {
  try {
    const order = mongoose.Types.ObjectId.isValid(req.params.orderId) ? await Order.findById(req.params.orderId) : null;
    if (!order || !canAccess(req, order.user)) return notFound(res, req.params.orderId);
    if (order.status === 'cancelled') return res.json(order);
    if (order.status !== 'pending') {
      return res.status(409).json({ message: `An order that is ${order.status} cannot be cancelled here` });
    }

    const updated = await changeStatus(order, 'cancelled');
    if (!updated) return res.status(409).json({ message: 'The order changed at the same time, reload and try again' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
};

// Admin: correct the shipping address. Lines and totals are fixed once the
// order is placed, because stock and payment depend on them.
exports.updateOrder = async (req, res) => {
  try {
    const address = typeof req.body?.shippingAddress === 'string' ? req.body.shippingAddress.trim() : '';
    if (address.length < 5 || address.length > 500) {
      return res.status(400).json({ message: 'shippingAddress must be 5 to 500 characters' });
    }
    const order = mongoose.Types.ObjectId.isValid(req.params.orderId)
      ? await Order.findByIdAndUpdate(req.params.orderId, { shippingAddress: address, updatedAt: Date.now() }, { new: true })
      : null;
    if (!order) return notFound(res, req.params.orderId);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order with id ' + req.params.orderId });
  }
};

// Admin: delete a cancelled order. Other orders still hold stock, so cancel them first.
exports.deleteOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) return notFound(res, req.params.orderId);
    const order = await Order.findOneAndDelete({ _id: req.params.orderId, status: 'cancelled' });
    if (order) return res.json({ message: 'Order deleted successfully!' });
    const exists = await Order.exists({ _id: req.params.orderId });
    if (!exists) return notFound(res, req.params.orderId);
    res.status(409).json({ message: 'Only cancelled orders can be deleted; cancel the order first' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not delete order with id ' + req.params.orderId });
  }
};
