const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const leadRoutes = require('./routes/leads');
const authRoutes = require('./routes/auth');

// Connect to Database only if MONGODB_URI is configured
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log("⚠️ MongoDB is not configured. Running in Demo Mode.");
}

const app = express();

// Security Headers (Helmet)
app.use(helmet());

// MongoDB query sanitization to prevent injection
app.use(mongoSanitize());

// Rate Limiting (limiter applied globally to API requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/leads', leadRoutes);
app.use('/api/auth', authRoutes);

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

const PORT = process.env.PORT || 5001;

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
