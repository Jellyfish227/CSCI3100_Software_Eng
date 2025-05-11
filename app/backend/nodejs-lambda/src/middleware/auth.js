/**
 * Authentication middleware
 */
const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const { getUserById } = require('../utils/db');

/**
 * Verify JWT token and attach user to request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Modified event with user attached
 */
const verifyToken = async (event) => {
  try {
    // Get token from Authorization header
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await getUserById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Attach user to event
    event.user = user;
    return event;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

/**
 * Middleware to validate user token
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Modified event with user attached or error response
 */
const validateToken = async (event) => {
  try {
    return await verifyToken(event);
  } catch (err) {
    throw {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'error',
        code: 401,
        error: 'Authentication Error',
        message: err.message || 'Authentication failed'
      })
    };
  }
};

/**
 * Check if user has required role
 * @param {string} role - Required role
 * @returns {Function} Middleware function
 */
const requireRole = (role) => {
  return async (event) => {
    await verifyToken(event);
    
    if (event.user.role !== role) {
      throw new Error(`Requires ${role} role`);
    }
    
    return event;
  };
};

/**
 * Check if user is the owner of a resource
 * @param {Function} getResource - Function to get resource by ID
 * @param {string} resourceIdField - Field name containing resource ID
 * @param {string} ownerField - Field name containing owner ID
 * @returns {Function} Middleware function
 */
const requireOwnership = (getResource, resourceIdField = 'id', ownerField = 'educator') => {
  return async (event) => {
    await verifyToken(event);
    
    const resourceId = event.pathParameters?.[resourceIdField];
    if (!resourceId) {
      throw new Error('Resource ID is required');
    }
    
    const resource = await getResource(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    if (resource[ownerField] !== event.user.id) {
      throw new Error('You do not have permission to perform this action');
    }
    
    return event;
  };
};

module.exports = {
  verifyToken,
  validateToken,
  requireRole,
  requireOwnership
}; 