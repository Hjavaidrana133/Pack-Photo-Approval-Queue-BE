const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { swaggerUi, swaggerDocs } = require('./config/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve Swagger UI static assets from node_modules
app.use('/swagger-ui-dist', express.static(path.join(__dirname, 'node_modules', 'swagger-ui-dist')));

// Update Swagger UI setup to load CSS from the public path
app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCssUrl: '/swagger-ui-dist/swagger-ui.css'
}));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;