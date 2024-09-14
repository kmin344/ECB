const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// router.get('/:id', (req, res) => {
//     res.status(501).json({ message: 'Get product by id not implemented yet' });
// });

// router.post('/', (req, res) => {
//     res.status(501).json({ message: 'Create product not implemented yet' });
// });

// router.put('/:id', (req, res) => {
//     res.status(501).json({ message: 'Update product not implemented yet' });
// });

// router.delete('/:id', (req, res) => {
//     res.status(501).json({ message: 'Delete product not implemented yet' });
// });

// module.exports = router;
