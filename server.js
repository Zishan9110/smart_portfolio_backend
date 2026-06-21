require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// ===== Security Middleware =====
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
console.log('Allowed Origins:', allowedOrigins); // Debug log

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Blocked origin:', origin); // Debug log
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers (must come before sanitization middleware)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Sanitize data against XSS
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter rate limit on login to deter brute-force attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/login', loginLimiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== Health Check Routes =====
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running', 
    timestamp: new Date().toISOString() 
  });
});

// ===== Routes =====
console.log('Registering routes...'); // Debug log

try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/profile', require('./routes/profileRoutes'));
  app.use('/api/projects', require('./routes/projectRoutes'));
  app.use('/api/skills', require('./routes/skillRoutes'));
  app.use('/api/experience', require('./routes/experienceRoutes'));
  app.use('/api/education', require('./routes/educationRoutes'));
  app.use('/api/certifications', require('./routes/certificationRoutes'));
  app.use('/api/achievements', require('./routes/achievementRoutes'));
  app.use('/api/timeline', require('./routes/timelineRoutes'));
  app.use('/api/tools', require('./routes/toolRoutes'));
  app.use('/api/contact', require('./routes/contactRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
  console.log('All routes registered successfully');
} catch (error) {
  console.error('Error registering routes:', error);
}

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/profile',
      '/api/projects',
      '/api/skills',
      '/api/experience',
      '/api/education',
      '/api/certifications',
      '/api/achievements',
      '/api/timeline',
      '/api/tools',
      '/api/contact',
      '/api/dashboard',
      '/api/health'
    ]
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

module.exports = app;