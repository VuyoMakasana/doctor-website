// middleware/auth.js — JWT Auth + Role-Based Access Control
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support both old admin tokens and new user tokens
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'User not found or inactive.' });
      }
      req.user = user;
    } else {
      // Legacy admin token support
      req.user = { role: 'admin', username: decoded.username };
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired.' });
  }
};

// Restrict to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not permitted.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
