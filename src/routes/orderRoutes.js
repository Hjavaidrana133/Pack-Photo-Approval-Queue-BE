const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /api/orders/{orderNumber}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The order number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/:orderNumber', orderController.updateOrder);

/**
 * @swagger
 * /api/orders/{orderNumber}:
 *   get:
 *     summary: Get an order by order number
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The order number
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/:orderNumber', orderController.getOrderByNumber);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders with optional filters
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: approvalStatus
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *         description: Filter orders by approval status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [Newest, Oldest]
 *         description: Sort orders by newest or oldest
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search orders by order number
 *     responses:
 *       200:
 *         description: List of filtered and sorted orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 */
router.get('/', orderController.getAllOrders);


module.exports = router;