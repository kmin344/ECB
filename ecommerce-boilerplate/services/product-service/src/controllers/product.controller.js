const mongoose = require('mongoose');
const Product = require('../models/product.model');

// Create and Save a new Product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product({
      thumbnail: req.body.thumbnail,
      images: req.body.images,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      inStock: req.body.inStock,
      stock: req.body.stock
    });

    const savedProduct = await product.save();
    res.status(201).send(savedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: error.message });
    }
    res.status(500).send({
      message: error.message || "Some error occurred while creating the Product."
    });
  }
};

// Retrieve all Products from the database
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving products."
    });
  }
};

// Find a single Product with a productId
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).send({
        message: "Product not found with id " + req.params.productId
      });
    }
    res.send(product);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).send({
        message: "Product not found with id " + req.params.productId
      });
    }
    return res.status(500).send({
      message: "Error retrieving product with id " + req.params.productId
    });
  }
};

// Update a Product identified by the productId in the request
exports.updateProduct = async (req, res) => {
  try {
    // Only update the fields the client sent, so a partial update such as
    // { stock: 15 } does not clear the other fields.
    const updatable = ['name', 'description', 'price', 'category', 'inStock', 'stock', 'thumbnail', 'images'];
    const changes = { updatedAt: Date.now() };
    for (const field of updatable) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }
    const product = await Product.findByIdAndUpdate(req.params.productId, changes, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).send({
        message: "Product not found with id " + req.params.productId
      });
    }
    res.send(product);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).send({
        message: "Product not found with id " + req.params.productId
      });
    }
    return res.status(500).send({
      message: "Error updating product with id " + req.params.productId
    });
  }
};

// Delete a Product with the specified productId in the request
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return res.status(404).send({
        message: "Product not found with id " + req.params.productId
      });
    }
    res.send({ message: "Product deleted successfully!" });
  } catch (error) {
    if (error.kind === 'ObjectId' || error.name === 'NotFound') {
      return res.status(404).send({
        message: "Product not found with id " + req.params.productId
      });
    }
    return res.status(500).send({
      message: "Could not delete product with id " + req.params.productId
    });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { products } = req.body;
    const availability = await Promise.all(products.map(async (item) => {
      const product = await Product.findById(item.productId);
      return {
        productId: item.productId,
        available: product ? product.stock >= item.quantity : false
      };
    }));
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error checking product availability', error: error.message });
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const { productId, category } = req.query;
    if (!category) {
      return res.status(400).json({ message: 'category is required' });
    }
    const filter = { category };
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      filter._id = { $ne: productId };
    }
    const products = await Product.find(filter).sort({ averageRating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching related products', error: error.message });
  }
};
