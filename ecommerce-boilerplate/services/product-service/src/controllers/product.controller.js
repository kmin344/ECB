const Product = require('../models/product.model');

// Create and Save a new Product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      inStock: req.body.inStock
    });

    const savedProduct = await product.save();
    res.status(201).send(savedProduct);
  } catch (error) {
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
    const product = await Product.findByIdAndUpdate(req.params.productId, {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      inStock: req.body.inStock,
      updatedAt: Date.now()
    }, { new: true });

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