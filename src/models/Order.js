const { getRedisClient } = require('../config/redis');

class Order {
  /**
   * Create a new Order instance
   * @param {Object} orderData - The order data
   */
  constructor(orderData) {
    // Core order details
    this.orderNumber = orderData.orderNumber; // Unique identifier for the order
    this.orderStatus = orderData.orderStatus; // Current status of the order (e.g., "packed")
    this.orderDate = orderData.orderDate; // Timestamp when the order was created
    this.packedDate = orderData.packedDate; // Timestamp when the order was packed
    this.shippedCarrier = orderData.shippedCarrier; // Shipping carrier (e.g., "FedEx")
    this.trackingNumber = orderData.trackingNumber; // Tracking number for the shipment
    this.customerEmail = orderData.customerEmail; // Customer's email address
    this.total = orderData.total; // Total order amount
    this.subTotal = orderData.subTotal; // Subtotal before taxes and discounts
    this.tax = orderData.tax; // Tax amount
    this.shippingAddress = orderData.shippingAddress; // Shipping address object
    this.lineItems = orderData.lineItems; // Array of line items in the order
    this.statusChanges = orderData.statusChanges; // Array of status changes with timestamps
    this.shipDate = orderData.shipDate; // Timestamp when the order is shipped
    this.deliveryPrediction = orderData.deliveryPrediction; // Predicted delivery date
    this.packedImage = orderData.packedImage; // URL of the packed image
    this.packedBy = orderData.packedBy; // Email of the user who packed the order
    this.orderFlag = orderData.orderFlag; // Object containing flag details (e.g., isFlagged, msg)
    this.onBatch = orderData.onBatch; // Batch information for the order
    this.readyToPrintDate = orderData.readyToPrintDate; // Timestamp when the order is ready to print
    this.filesDueBy = orderData.filesDueBy; // Timestamp for files due by
    this.orderApprovedDate = orderData.orderApprovedDate; // Timestamp when the order was approved
    this.cutDate = orderData.cutDate; // Timestamp for the cut date
    this.lastModified = orderData.lastModified; // Timestamp for the last modification
    this.dealsOnOrder = orderData.dealsOnOrder; // Deals applied to the order
    this.discounts = orderData.discounts; // Discounts applied to the order
    this.fb_pixel_id = orderData.fb_pixel_id; // Facebook Pixel ID
    this.shippingService = orderData.shippingService; // Shipping service details
    this.orderBatchedDate = orderData.orderBatchedDate; // Timestamp when the order was batched
    this.timeSpent = orderData.timeSpent; // Time spent on the order
    this.firstOrder = orderData.firstOrder; // Boolean indicating if it's the customer's first order
    this.onTheWayPridiction = orderData.onTheWayPridiction; // Prediction for delivery
    this.printDate = orderData.printDate; // Timestamp when the order was printed
    this.shippingPridiction = orderData.shippingPridiction; // Shipping prediction details
    this.paymentInfo = orderData.paymentInfo; // Payment information
    this.accountFlag = orderData.accountFlag; // Account flag details
    this.approvalStatus = orderData.approvalStatus || 'pending'; // New field for approve/reject status
  }

  /**
   * Serialize the order for storage in Redis
   * @returns {Object} - Serialized order data
   */
  serialize() {
    const serialized = {};

    // Iterate over all properties of the order
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'object' && value !== null) {
        // Convert nested objects/arrays to JSON strings
        serialized[key] = JSON.stringify(value);
      } else {
        // Pass primitive values as-is
        serialized[key] = value;
      }
    }

    return serialized;
  }

  /**
   * Deserialize an order from Redis
   * @param {Object} data - The raw data from Redis
   * @returns {Order} - Deserialized Order instance
   */
  static deserialize(data) {
    if (!data) return null;

    const parsed = { ...data };

    // Parse JSON strings back into objects
    const jsonFields = [
      'shippingAddress',
      'lineItems',
      'statusChanges',
      'orderFlag',
      'accountFlag',
      'discounts',
      'dealsOnOrder',
      'shippingService',
      'onTheWayPridiction',
      'shippingPridiction',
    ];

    jsonFields.forEach((field) => {
      if (typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch (error) {
          console.error(`Error parsing ${field}:`, error);
          parsed[field] = null;
        }
      }
    });

    return new Order(parsed);
  }

  /**
   * Save order to Redis
   * @returns {Promise<Order>} - The saved order instance
   */
  async save() {
    const client = getRedisClient();
    const key = `order:${this.orderNumber}`;
    const serialized = this.serialize();

    // Convert the serialized object to a flat key-value pair for hSet
    const flatData = [];
    for (const [field, value] of Object.entries(serialized)) {
      if (value !== undefined) { // Skip undefined values
        flatData.push(field, value);
      }
    }

    // Use hSet with the flattened data
    await client.hSet(key, flatData);

    return this;
  }

  /**
   * Find an order by order number
   * @param {string} orderNumber - The order number to find
   * @returns {Promise<Order|null>} - The found order or null if not found
   */
  static async findByOrderNumber(orderNumber) {
    const client = getRedisClient();
    const key = `order:${orderNumber}`;

    const data = await client.hGetAll(key);
    if (Object.keys(data).length === 0) return null;

    return Order.deserialize(data);
  }

  /**
   * Find orders by filters
   * @param {Object} filters - The filters to apply
   * @returns {Promise<Array>} - Array of filtered orders
   */
  static async findByFilters(filters) {
    const client = getRedisClient();
    const keys = await client.keys('order:*'); // Get all order keys

    const orders = [];
    for (const key of keys) {
      const data = await client.hGetAll(key); // Fetch order data
      const order = Order.deserialize(data);
      orders.push(order);
    }

    // Apply filters
    return orders.filter((order) => {
      let match = true;

      // Filter by approvalStatus
      if (filters.approvalStatus && order.approvalStatus !== filters.approvalStatus) {
        match = false;
      }

      // Filter by orderNumber (case-insensitive search)
      if (filters.search && !order.orderNumber.toLowerCase().includes(filters.search.toLowerCase())) {
        match = false;
      }

      return match;
    });
  }

  /**
   * Update order status
   * @param {string} newStatus - The new status to set
   * @returns {Promise<Order>} - The updated order instance
   */
  async updateStatus(newStatus) {
    const client = getRedisClient();
    const key = `order:${this.orderNumber}`;

    // Update status in memory
    this.orderStatus = newStatus;

    // Add to status changes
    const statusChange = JSON.stringify({
      date: Date.now(),
      status: newStatus,
    });

    let statusChanges = [];
    try {
      if (typeof this.statusChanges === 'string') {
        statusChanges = JSON.parse(this.statusChanges);
      } else if (Array.isArray(this.statusChanges)) {
        statusChanges = this.statusChanges;
      }
    } catch (error) {
      console.error('Error parsing status changes:', error);
    }

    statusChanges.push(statusChange);
    this.statusChanges = JSON.stringify(statusChanges);

    // If status is "packed", set packed date
    if (newStatus === 'packed') {
      this.packedDate = Date.now();
    }

    // Update order in Redis
    const serialized = this.serialize();
    await client.hSet(key, serialized);

    return this;
  }
}

module.exports = Order;