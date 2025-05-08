/**
 * User login handler
 */
const { success, error } = require('../../utils/response');
const { connectToDatabase } = require('../../utils/db');
const User = require('../../models/User');
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
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.email || !body.password) {
      return error(400, 'Validation Error', 'Email and password are required');
    }
    
    // Find user by email
    const user = await User.findOne({ email: body.email });
    
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
    user.last_login = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    // Prepare user data for response (exclude password)
    const safeUser = {
      id: user._id,
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