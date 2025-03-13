// /api/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('../src/routes');
const errorHandler = require('../src/middleware/errorHandler');
const { swaggerUi, swaggerDocs } = require('../src/config/swagger');
const { connectRedis } = require('../src/config/redis');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Lazy Redis connection - only connect when actually needed
let redisConnected = false;
app.use(async (req, res, next) => {
  // Only try to connect to Redis for routes that need it
  // You may need to adjust this condition based on your actual needs
  if (!redisConnected && req.path.startsWith('/api/') && req.path !== '/api/health') {
    try {
      await connectRedis();
      redisConnected = true;
      console.log('Connected to Redis');
    } catch (error) {
      // Log error but don't fail the request
      console.error('Redis connection failed:', error);
      // You might want to set a flag or handle this differently
    }
  }
  next();
});

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API routes
app.use('/api', routes);

// Simple route to test functionality
app.get('/', (req, res) => {
  res.json({ status: 'working' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Export the Express app
module.exports = app;