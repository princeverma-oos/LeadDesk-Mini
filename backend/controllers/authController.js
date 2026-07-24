const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Helper to check if DB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Admin Login
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    if (!isDbConnected()) {
      return res.status(500).json({
        success: false,
        message: 'Database is not connected. Authentication features are unavailable.'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, username: admin.username, email: admin.email },
      process.env.JWT_SECRET || 'super_secret_jwt_key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error during login'
    });
  }
};

// @desc    Verify current JWT token (automatically check on page refresh)
// @route   GET /api/auth/verify
const verifyToken = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(500).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Verify token error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error during token verification'
    });
  }
};

module.exports = {
  login,
  verifyToken
};
