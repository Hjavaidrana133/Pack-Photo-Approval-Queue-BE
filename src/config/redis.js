const redis = require('redis');
require('dotenv').config();

let client;

async function connectRedis() {
  try {
    // Create Redis client
    client = redis.createClient({
      url: process.env.REDIS_URL
    });

    // Set up event handlers
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('Redis client connected');
    });

    client.on('ready', () => {
      console.log('Redis client ready');
    });

    client.on('reconnecting', () => {
      console.log('Redis client reconnecting');
    });

    client.on('end', () => {
      console.log('Redis client connection closed');
    });

    // Connect to Redis
    await client.connect();

    console.log("-------------------> client", client);
    
    return client;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

function getRedisClient() {
  if (!client || !client.isOpen) {
    throw new Error('Redis client not connected');
  }
  return client;
}

async function closeRedisConnection() {
  if (client && client.isOpen) {
    await client.quit();
    console.log('Redis connection closed');
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  closeRedisConnection
};