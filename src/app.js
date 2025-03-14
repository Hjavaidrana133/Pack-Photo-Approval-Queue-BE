const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import your routes, error handlers, etc.
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Import the Swagger config
const { swaggerUi, swaggerDocs } = require('./config/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

/**
 * 1) Serve the Swagger UI static assets from node_modules
 *    Adjust the path to node_modules as needed.
 */
app.use(
  '/swagger-ui-dist',
  express.static(path.join(__dirname, '../node_modules/swagger-ui-dist'))
);

/**
 * 2) Reference the CSS via an HTTP URL
 *    Instead of using swaggerUiDist.getAbsoluteFSPath(),
 *    we point to the static path we just configured.
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCssUrl: '/swagger-ui-dist/swagger-ui.css',
  })
);

// Example routes
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;