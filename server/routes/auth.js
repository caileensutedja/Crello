const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const jwt = require('jsonwebtoken')

const router = express.Router();

// POST SIGN UP ROUTE
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic Validation for name, email, password
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Checks if email exists or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    // Add password hashing with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);     // 10 describes how much computational effort goes into the hash
    const user = await User.create({ name, email, passwordHash });

    // Create JWT token for auto-login after signup (same as login route)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token + user info, matching the login route format
    // This allows the frontend to auto-login new users after signup
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST LOG IN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Basic Validation for email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find email in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compares the password entered and stored
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create the token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send back the token
    res.json({
      token, // JWT string, frontend saves to localStorage
      user: { // user info
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;