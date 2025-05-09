/**
 * Local development server
 * This file is used to run the Lambda functions locally for development and testing
 */
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./utils/db');

// Import handlers
const authHandlers = require('./handlers/auth');
const courseHandlers = require('./handlers/courses');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Convert Lambda function response to Express response
const lambdaToExpress = async (lambdaHandler, req, res) => {
  try {
    // Create API Gateway event from Express request
    const event = {
      httpMethod: req.method,
      path: req.path,
      pathParameters: req.params,
      queryStringParameters: req.query,
      headers: req.headers,
      body: JSON.stringify(req.body),
      isBase64Encoded: false
    };
    
    // Call Lambda handler
    const lambdaResponse = await lambdaHandler(event);
    
    // Set status code
    res.status(lambdaResponse.statusCode);
    
    // Set headers
    if (lambdaResponse.headers) {
      Object.keys(lambdaResponse.headers).forEach(key => {
        res.setHeader(key, lambdaResponse.headers[key]);
      });
    }
    
    // Send response body
    if (lambdaResponse.body) {
      return res.send(JSON.parse(lambdaResponse.body));
    }
    
    return res.send();
  } catch (err) {
    console.error('Error in Lambda execution:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
    });
  }
};

// Auth routes
app.post('/auth/login', (req, res) => lambdaToExpress(authHandlers.login.handler, req, res));

// Course routes
app.get('/courses', (req, res) => lambdaToExpress(courseHandlers.list.handler, req, res));
app.get('/courses/featured', (req, res) => lambdaToExpress(courseHandlers.featured.handler, req, res));
app.get('/courses/:id', (req, res) => lambdaToExpress(courseHandlers.get.handler, req, res));
app.post('/courses', (req, res) => lambdaToExpress(courseHandlers.create.handler, req, res));
app.put('/courses/:id', (req, res) => lambdaToExpress(courseHandlers.update.handler, req, res));
app.delete('/courses/:id', (req, res) => lambdaToExpress(courseHandlers.delete.handler, req, res));

// Start server
app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
}); 