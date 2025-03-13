const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Management API',
      version: '1.0.0',
      description: 'API for managing orders',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'https://orderbackend.netlify.app/.netlify/functions',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000/.netlify/functions',
        description: 'Local server',
      }
    ],
    components: {
      schemas: {
        Order: {
          type: 'object',
          properties: {
            orderNumber: {
              type: 'string',
              description: 'The unique identifier for the order',
            },
            orderStatus: {
              type: 'string',
              description: 'The current status of the order',
            },
            orderDate: {
              type: 'number',
              description: 'The timestamp when the order was created',
            },
            packedDate: {
              type: 'number',
              description: 'The timestamp when the order was packed',
            },
            shippedCarrier: {
              type: 'string',
              description: 'The shipping carrier (e.g., FedEx)',
            },
            trackingNumber: {
              type: 'string',
              description: 'The tracking number for the shipment',
            },
            customerEmail: {
              type: 'string',
              description: 'The email address of the customer',
            },
            total: {
              type: 'number',
              description: 'The total amount of the order',
            },
            subTotal: {
              type: 'number',
              description: 'The subtotal before taxes and discounts',
            },
            tax: {
              type: 'number',
              description: 'The tax amount',
            },
            shippingAddress: {
              type: 'object',
              description: 'The shipping address of the customer',
            },
            lineItems: {
              type: 'array',
              description: 'The list of items in the order',
              items: {
                type: 'object',
              },
            },
            statusChanges: {
              type: 'array',
              description: 'The history of status changes for the order',
              items: {
                type: 'string',
              },
            },
            approvalStatus: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'The approval status of the order',
            },
          },
          required: ['orderNumber', 'orderStatus'],
        },
      },
    },
  },
  // Path to the API routes files
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs,
};