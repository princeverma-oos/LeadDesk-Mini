const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const leadRoutes = require('./routes/leads');

// Connect to Database
// Connect to Database only if MONGODB_URI is provided
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log("⚠️ MongoDB is not configured. Running in Demo Mode.");
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/leads', leadRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('LeadDesk Mini API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    demoMode: !process.env.MONGODB_URI,
    message: process.env.MONGODB_URI
      ? "Database Connected"
      : "Demo Mode: Database not connected. Configure MONGODB_URI to enable data persistence."
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
