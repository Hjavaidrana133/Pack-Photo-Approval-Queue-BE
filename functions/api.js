const serverless = require('serverless-http');
const app = require('../src/app');
const { connectRedis } = require('../src/config/redis');
require('dotenv').config();

async function initializeRedis() {
  try {
    await connectRedis();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
}

initializeRedis();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports.handler = serverless(app);