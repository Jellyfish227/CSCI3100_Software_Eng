/**
 * Token validation handler
 */
const { success, error } = require('../../utils/response');
const { getUserById } = require('../../utils/db');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'kaiju-academy-secret-key';

/**
 * Handle token validation request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Check if Authorization header exists
    const authHeader = event.headers?.Authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return error(401, 'Authentication Error', 'Invalid or missing authentication token');
    }
    
    // Extract token
    const token = authHeader.substring(7);
    
    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const user = await getUserById(decoded.userId);
      
      if (!user) {
        return error(401, 'Authentication Error', 'User not found');
      }
      
      // Prepare user data for response (remove password)
      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        profile_image: user.profile_image,
        bio: user.bio
      };
      
      // Return success response
      return success(200, {
        message: "Token is valid",
        user: safeUser
      });
    } catch (err) {
      return error(401, 'Authentication Error', 'Invalid authentication token');
    }
  } catch (err) {
    console.error('Error in validate token handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 