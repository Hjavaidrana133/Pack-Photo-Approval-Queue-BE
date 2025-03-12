const express = require('express');
const orderRoutes = require('./orderRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */
// Mount routes
router.use('/orders', orderRoutes);

module.exports = router;