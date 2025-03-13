const { getRedisClient } = require('../config/redis');

class Order {
  /**
   * Create a new Order instance
   * @param {Object} orderData - The order data
   */
  constructor(orderData) {

    this.orderNumber = orderData.orderNumber;
    this.orderStatus = orderData.orderStatus;
    this.orderDate = orderData.orderDate;
    this.packedDate = orderData.packedDate;
    this.shippedCarrier = orderData.shippedCarrier;
    this.trackingNumber = orderData.trackingNumber;
    this.customerEmail = orderData.customerEmail;
    this.total = orderData.total;
    this.subTotal = orderData.subTotal;
    this.tax = orderData.tax;
    this.shippingAddress = orderData.shippingAddress;
    this.lineItems = orderData.lineItems;
    this.statusChanges = orderData.statusChanges;
    this.shipDate = orderData.shipDate;
    this.deliveryPrediction = orderData.deliveryPrediction;
    this.packedImage = orderData.packedImage;
    this.packedBy = orderData.packedBy;
    this.orderFlag = orderData.orderFlag;
    this.onBatch = orderData.onBatch;
    this.readyToPrintDate = orderData.readyToPrintDate;
    this.filesDueBy = orderData.filesDueBy;
    this.orderApprovedDate = orderData.orderApprovedDate;
    this.cutDate = orderData.cutDate;
    this.lastModified = orderData.lastModified;
    this.dealsOnOrder = orderData.dealsOnOrder;
    this.discounts = orderData.discounts;
    this.fb_pixel_id = orderData.fb_pixel_id;
    this.shippingService = orderData.shippingService;
    this.orderBatchedDate = orderData.orderBatchedDate;
    this.timeSpent = orderData.timeSpent;
    this.firstOrder = orderData.firstOrder;
    this.onTheWayPridiction = orderData.onTheWayPridiction;
    this.printDate = orderData.printDate;
    this.shippingPridiction = orderData.shippingPridiction;
    this.paymentInfo = orderData.paymentInfo;
    this.accountFlag = orderData.accountFlag;
    this.approvalStatus = orderData.approvalStatus || 'pending';
  }

  /**
   * Serialize the order for storage in Redis
   * @returns {Object} - Serialized order data
   */
  serialize() {
    const serialized = {};


    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'object' && value !== null) {

        serialized[key] = JSON.stringify(value);
      } else {

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


    const flatData = [];
    for (const [field, value] of Object.entries(serialized)) {
      if (value !== undefined) {
        flatData.push(field, value);
      }
    }


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
    const keys = await client.keys('order:*');

    const orders = [];
    for (const key of keys) {
      const data = await client.hGetAll(key);
      const order = Order.deserialize(data);
      orders.push(order);
    }


    return orders.filter((order) => {
      let match = true;


      if (filters.approvalStatus && order.approvalStatus !== filters.approvalStatus) {
        match = false;
      }


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


    this.orderStatus = newStatus;


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


    if (newStatus === 'packed') {
      this.packedDate = Date.now();
    }


    const serialized = this.serialize();
    await client.hSet(key, serialized);

    return this;
  }
}

module.exports = Order;