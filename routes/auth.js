// routes/auth.js — Login & Signup for Doctors and Receptionists
const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// -----------------------------------------------
// POST /api/auth/signup
// Register a new doctor or receptionist
// Only existing admins/receptionists can create doctors
// Receptionists can self-register (or admin creates them)
// -----------------------------------------------
router.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, username, password, and role are required.' });
    }

    if (!['doctor', 'receptionist'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be doctor or receptionist.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // determine who is creating this account (if authenticated)
    let creator = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.userId) {
          creator = await User.findById(decoded.userId).select('-password');
        } else {
          // legacy admin token support
          creator = { role: 'admin', username: decoded.username };
        }
      } catch (err) {
        // invalid token – ignore, treat as public request
      }
    }

    // only admins or receptionists can create doctor accounts
    if (role === 'doctor' && (!creator || !['admin', 'receptionist'].includes(creator.role))) {
      return res.status(403).json({ success: false, message: 'Only admin or receptionist can create doctor accounts.' });
    }

    // receptionist signup is allowed publicly; if creator exists ensure they are admin/receptionist
    if (role === 'receptionist' && creator && !['admin', 'receptionist'].includes(creator.role)) {
      return res.status(403).json({ success: false, message: 'Only admin or receptionist can create receptionist accounts.' });
    }

    // Check if username already taken
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username already taken. Please choose another.' });
    }

    const user = await User.create({ name, username, email, password, role });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: ` ${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Username already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// POST /api/auth/login
// Login for doctors and receptionists
// Body: { username, password }
// -----------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password.' });
    }

    // Find user by username
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// GET /api/auth/me
// Get logged-in user's profile
// -----------------------------------------------
router.get('/me', protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// -----------------------------------------------
// GET /api/auth/users
// PROTECTED — List all users (admin/receptionist only)
// -----------------------------------------------
router.get('/users', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------
// DELETE /api/auth/users/:id
// PROTECTED — Delete user (admin only)
// -----------------------------------------------
router.delete('/users/:id', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
