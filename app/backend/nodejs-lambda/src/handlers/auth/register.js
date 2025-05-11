/**
 * User registration handler
 */
const { success, error } = require('../../utils/response');
const { getUserByEmail, createUser } = require('../../utils/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/**
 * Handle registration request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.password || !body.email || !body.name || !body.role) {
      return error(400, 'Validation Error', 'Email, password, name, and role are required');
    }
    
    // Check if email is valid
    if (!isValidEmail(body.email)) {
      return error(400, 'Validation Error', 'Invalid email address');
    }
    
    // Check if email exists
    const existingUser = await getUserByEmail(body.email);
    if (existingUser) {
      return error(409, 'Validation Error', 'Email already in use');
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    
    // Create user object
    const userData = {
      id: `user:${uuidv4()}`,
      email: body.email,
      password: hashedPassword,
      name: body.name,
      role: body.role,
      bio: body.bio || '',
      profile_image: body.profile_image || null,
      created_at: new Date().toISOString()
    };
    
    // Create user in DynamoDB
    await createUser(userData);
    
    // Prepare user data for response (remove password)
    const safeUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      created_at: userData.created_at,
      profile_image: userData.profile_image,
      bio: userData.bio
    };
    
    // Return success response
    return success(201, {
      message: "Registration successful",
      user: safeUser
    });
  } catch (err) {
    console.error('Error in registration handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = { handler }; 