const mongoose = require('mongoose');
const Product = require('../models/product.model');

const MAX_ITEMS = 50;
const MAX_QUANTITY = 1000;

// Checks [{ productId, quantity }] from another service. Returns an error message or null.
function invalidItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
    return `items must be a list of 1 to ${MAX_ITEMS} entries`;
  }
  const seen = new Set();
  for (const item of items) {
    if (!item || typeof item.productId !== 'string' || !mongoose.Types.ObjectId.isValid(item.productId)) {
      return 'each item needs a valid productId';
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      return `quantity must be a whole number from 1 to ${MAX_QUANTITY}`;
    }
    if (seen.has(item.productId)) return 'each product may appear only once';
    seen.add(item.productId);
  }
  return null;
}

const giveBack = (items) =>
  Promise.all(items.map((i) => Product.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity } })));

// Takes stock for every item, or for none. Each decrement is one atomic update
// that only matches while enough stock is left, so two orders cannot both take
// the last unit. If an item fails, the items already taken are given back.
// Returns the current name and price of each product: the order uses these,
// never prices sent by the shopper.
exports.reserve = async (req, res) => {
  const { items } = req.body || {};
  const problem = invalidItems(items);
  if (problem) return res.status(400).json({ message: problem });

  const taken = [];
  try {
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, projection: { name: 1, price: 1 } },
      );
      if (!product) {
        await giveBack(taken);
        const exists = await Product.exists({ _id: item.productId });
        return res.status(exists ? 409 : 404).json({
          message: exists ? 'Not enough stock' : 'Product not found',
          productId: item.productId,
        });
      }
      taken.push({ ...item, name: product.name, price: product.price });
    }
    res.json({ items: taken });
  } catch (error) {
    console.error(error);
    await giveBack(taken).catch((e) => console.error('Could not give back stock', taken, e));
    res.status(500).json({ message: 'Error reserving stock' });
  }
};

// Returns stock, for example when an order is cancelled or could not be saved.
exports.release = async (req, res) => {
  const { items } = req.body || {};
  const problem = invalidItems(items);
  if (problem) return res.status(400).json({ message: problem });

  try {
    await giveBack(items);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error releasing stock' });
  }
};
