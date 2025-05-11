/**
 * User profile update handler
 */
const { success, error } = require('../../utils/response');
const { getUserById, updateUser } = require('../../utils/db');

/**
 * Handle profile update request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Check if user is authenticated
    if (!event.user || !event.user.id) {
      return error(401, 'Authentication Error', 'You must be logged in to update your profile');
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Get current user data
    const user = await getUserById(event.user.id);
    if (!user) {
      return error(404, 'Not Found', 'User not found');
    }
    
    // Prepare updates object (only allow specific fields to be updated)
    const updates = {};
    
    // Allow name update
    if (body.name !== undefined) {
      updates.name = body.name;
    }
    
    // Allow bio update
    if (body.bio !== undefined) {
      updates.bio = body.bio;
    }
    
    // Allow profile image update
    if (body.profile_image !== undefined) {
      updates.profile_image = body.profile_image;
    }
    
    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return error(400, 'Bad Request', 'No valid fields provided for update');
    }
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    // Update user in database
    const updatedUser = await updateUser(user.id, updates);
    
    // Prepare safe user object without sensitive data
    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      profile_image: updatedUser.profile_image,
      bio: updatedUser.bio
    };
    
    // Return success response
    return success(200, {
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (err) {
    console.error('Error in profile update handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 