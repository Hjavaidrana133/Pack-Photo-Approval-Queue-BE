const app = require('./src/app');
const { connectRedis } = require('./src/config/redis');
require('dotenv').config();

const PORT = process.env.PORT;

// Connect to Redis before starting the server
async function startServer() {
  try {
    // Initialize Redis connection
    await connectRedis();
    console.log('Connected to Redis');

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});