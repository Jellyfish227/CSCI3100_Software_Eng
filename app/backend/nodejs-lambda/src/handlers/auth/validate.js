/**
 * Token validation handler
 */
const { success, error } = require('../../utils/response');
const { users } = require('./login');

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
    let userId;
    
    try {
      // Decode the base64 token
      const decoded = Buffer.from(token, 'base64').toString();
      userId = decoded.split(':')[0];
    } catch (err) {
      return error(401, 'Authentication Error', 'Invalid authentication token');
    }
    
    // Find the user
    const user = users.find(u => u.id === userId);
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
    console.error('Error in validate token handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 