const User = require('../models/user.model');

// Loads the caller's role. Tokens only carry the user ID, so the role is
// read from the database rather than trusted from the client.
exports.loadCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, 'role');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    req.user.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

exports.requireSelfOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
    return res.status(403).json({ message: 'You can only access your own account' });
  }
  next();
};
