const Order = require('../models/Order');


async function createOrder(req, res) {
  try {
    const orderData = req.body;


    if (!orderData.orderNumber || !orderData.orderStatus) {
      return res.status(400).json({ message: 'orderNumber and orderStatus are required' });
    }


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


    const order = await Order.findByOrderNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }


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


    const filter = {};
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }
    if (search) {
      filter.orderNumber = { $regex: search, $options: 'i' };
    }


    const orders = await Order.findByFilters(filter);


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