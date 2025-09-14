const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Pincode = require('../models/Pincode');
const auth = require('../middleware/auth');
const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register user
router.post('/register', [
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).withMessage('Aadhaar must be 12 digits'),
  body('mobileNumber').isLength({ min: 10, max: 10 }).withMessage('Mobile must be 10 digits'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { aadhaarNumber, mobileNumber, password, pincode, language } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ aadhaarNumber }, { mobileNumber }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this Aadhaar or mobile number' });
    }

    // Check if pincode exists and get sector
    const pincodeData = await Pincode.findOne({ pincode });
    if (!pincodeData) {
      return res.status(400).json({ message: 'Pincode not found in our database' });
    }

    // Generate UID (first 4 from Aadhaar + 8 random alphanumeric)
    const firstFour = aadhaarNumber.substring(0, 4);
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const uid = firstFour + randomPart;

    // Create user
    const user = new User({
      aadhaarNumber,
      mobileNumber,
      password,
      uid,
      pincode,
      sector: pincodeData.sector,
      language: language || 'en'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        aadhaarNumber: user.aadhaarNumber,
        mobileNumber: user.mobileNumber,
        uid: user.uid,
        pincode: user.pincode,
        sector: user.sector,
        language: user.language
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).withMessage('Aadhaar must be 12 digits'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { aadhaarNumber, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ aadhaarNumber }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        aadhaarNumber: user.aadhaarNumber,
        mobileNumber: user.mobileNumber,
        uid: user.uid,
        pincode: user.pincode,
        sector: user.sector,
        language: user.language
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Forgot password - generate OTP
router.post('/forgot-password', [
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).withMessage('Aadhaar must be 12 digits')
], async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    
    const user = await User.findOne({ aadhaarNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP (in a real application, you would send this via SMS/Email)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + process.env.OTP_EXPIRE_MINUTES * 60 * 1000);

    // In a real app, you would save the OTP and send it via SMS/email
    // For now, we'll just return it (this is for development only)
    res.json({
      success: true,
      message: 'OTP generated successfully',
      otp, // Remove this in production - only for development
      otpExpiry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with OTP
router.post('/reset-password', [
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).withMessage('Aadhaar must be 12 digits'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const { aadhaarNumber, otp, newPassword } = req.body;
    
    // In a real application, you would verify the OTP from database
    // For this example, we'll skip OTP verification and just reset the password
    
    const user = await User.findOne({ aadhaarNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;