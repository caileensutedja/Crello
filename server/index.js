require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// AUTH ROUTE
const authRoutes = require('./routes/auth');

// Connect to Mongoose
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json()); 

// Allows Cross-Origin Resource Sharing (CORS)
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Auth Route
app.use('/api/auth', authRoutes);

// Test Ping Route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});