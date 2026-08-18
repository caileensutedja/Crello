require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const cardRoutes = require('./routes/cards');

const app = express();
const PORT = process.env.PORT || 3000;

// AUTH ROUTE
const authRoutes = require('./routes/auth');

// Connect to Mongoose
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Allows Cross-Origin Resource Sharing (CORS)
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Auth Route
app.use('/api/auth', authRoutes);

// Board Route
app.use('/api/boards', boardRoutes);

// List Route
app.use('/api/boards', listRoutes);

// Card Route
app.use('/api/boards', cardRoutes);

// Test Ping Route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});