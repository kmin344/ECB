const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(501).json({ message: 'Get all orders not implemented yet' });
});

router.get('/:id', (req, res) => {
    res.status(501).json({ message: 'Get order by id not implemented yet' });
});

router.post('/', (req, res) => {
    res.status(501).json({ message: 'Create order not implemented yet' });
});

router.put('/:id', (req, res) => {
    res.status(501).json({ message: 'Update order not implemented yet' });
});

router.delete('/:id', (req, res) => {
    res.status(501).json({ message: 'Delete order not implemented yet' });
});

module.exports = router;
