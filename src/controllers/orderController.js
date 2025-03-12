const Order = require('../models/Order');


async function createOrder(req, res) {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.orderNumber || !orderData.orderStatus) {
      return res.status(400).json({ message: 'orderNumber and orderStatus are required' });
    }

    // Create and save the order
    const order = new Order(orderData);
    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
}

async function updateOrder(req, res) {
  try {
    const { orderNumber } = req.params;
    const updates = req.body;

    // Find the order
    const order = await Order.findByOrderNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Apply updates
    Object.assign(order, updates);
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
}

async function getOrderByNumber(req, res) {
  try {
    const { orderNumber } = req.params;

    // Find the order
    const order = await Order.findByOrderNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
}

async function getAllOrders(req, res) {
  try {
    const { approvalStatus, sort, search } = req.query;

    // Build the filter object
    const filter = {};
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }
    if (search) {
      filter.orderNumber = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    // Fetch orders from Redis or database
    const orders = await Order.findByFilters(filter);

    // Sort orders if required
    if (sort === 'Newest') {
      orders.sort((a, b) => b.orderDate - a.orderDate);
    } else if (sort === 'Oldest') {
      orders.sort((a, b) => a.orderDate - b.orderDate);
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createOrder,
  updateOrder,
  getOrderByNumber,
  getAllOrders
};