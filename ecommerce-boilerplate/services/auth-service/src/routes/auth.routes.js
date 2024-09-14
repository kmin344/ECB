const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
    res.status(501).json({ message: 'User registration not implemented yet' });
});

router.post('/login', (req, res) => {
    res.status(501).json({ message: 'User login not implemented yet' });
});

router.post('/logout', (req, res) => {
    res.status(501).json({ message: 'User logout not implemented yet' });
});

module.exports = router;
