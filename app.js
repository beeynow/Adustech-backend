
require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Connect to PostgreSQL (async for serverless)
connectDB().catch(err => {
  console.error('Failed to connect to PostgreSQL:', err);
});

// Env sanity logs (non-sensitive)
if (!process.env.POWER_ADMIN_EMAIL) {
  console.warn('⚠️ POWER_ADMIN_EMAIL is not set in .env. No power admin will be auto-assigned.');
} else {
  console.log(`🔐 POWER_ADMIN_EMAIL configured: ${process.env.POWER_ADMIN_EMAIL}`);
}

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// CORS Configuration - Allow all origins (open API)
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Note: NoSQL injection protection not needed for PostgreSQL + Prisma
// Prisma uses parameterized queries which prevent SQL injection by default

// Session Configuration with PostgreSQL store
const sessionSecret = process.env.SESSION_SECRET || 'change-this-secret-in-production';
if (sessionSecret === 'change-this-secret-in-production') {
  console.warn('⚠️ Using default SESSION_SECRET. Set a secure secret in production!');
}

// Create PostgreSQL connection pool for sessions
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new pgSession({
    pool: pgPool,
    tableName: 'Session', // Must match Prisma schema
    createTableIfMissing: true,
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // For cross-site cookies
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postsRoutes = require('./routes/postsRoutes');
const channelsRoutes = require('./routes/channelsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const timetablesRoutes = require('./routes/timetablesRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', postsRoutes);
app.use('/api', channelsRoutes);
app.use('/api', eventsRoutes);
app.use('/api', timetablesRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.message });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  // Generic error response
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Something went wrong',
  });
});

// Export for serverless environments (Vercel, etc.)
module.exports = app;

// Start server for traditional hosting (Railway, Heroku, etc.)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || '0.0.0.0';
  
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on ${HOST}:${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://${HOST}:${PORT}/api/health`);
    
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      console.log(`🌐 Public URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
  });
}