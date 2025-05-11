/**
 * Get user information handler
 */
const { success, error } = require('../../utils/response');
const { getUserById } = require('../../utils/db');

/**
 * Handle get user request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Check if user is authenticated
    if (!event.user || !event.user.id) {
      return error(401, 'Authentication Error', 'You must be logged in to access user information');
    }
    
    // Get user ID from path parameters or use authenticated user's ID
    let userId = event.user.id;
    if (event.pathParameters && event.pathParameters.id) {
      // Only allow admin users to access other user profiles
      if (event.user.role !== 'admin' && event.pathParameters.id !== event.user.id) {
        return error(403, 'Authorization Error', 'You do not have permission to view this user profile');
      }
      userId = event.pathParameters.id;
    }
    
    // Get user data
    const user = await getUserById(userId);
    if (!user) {
      return error(404, 'Not Found', 'User not found');
    }
    
    // Prepare safe user object without sensitive data
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
      profile_image: user.profile_image,
      bio: user.bio
    };
    
    // Return success response
    return success(200, {
      user: safeUser
    });
  } catch (err) {
    console.error('Error in get user handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 