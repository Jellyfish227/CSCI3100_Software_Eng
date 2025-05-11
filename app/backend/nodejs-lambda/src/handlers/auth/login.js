/**
 * User login handler
 */
const { success, error } = require('../../utils/response');
const { getUserByEmail, updateUser } = require('../../utils/db');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'kaiju-academy-secret-key';

/**
 * Handle login request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.email || !body.password) {
      return error(400, 'Validation Error', 'Email and password are required');
    }
    
    // Find user by email
    const user = await getUserByEmail(body.email);
    
    // User not found
    if (!user) {
      return error(401, 'Authentication Error', 'Invalid email or password');
    }
    
    // In a production environment, you would use bcrypt to compare hashed passwords
    // This is a simplified version for demonstration
    if (user.password !== body.password) {
      return error(401, 'Authentication Error', 'Invalid email or password');
    }
    
    // Update last login time
    await updateUser(user.id, {
      last_login: new Date().toISOString()
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    // Prepare user data for response (exclude password)
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
      message: "Login successful",
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Error in login handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

// Export the handler
module.exports = { handler }; 