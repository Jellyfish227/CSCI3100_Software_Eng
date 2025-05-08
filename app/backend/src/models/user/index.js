/**
 * User model for database operations
 */
const { getConnection } = require('../../db/connection');
const { RecordID } = require('surrealdb');

/**
 * Create a new user
 * 
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user
 */
const createUser = async (userData) => {
  const db = await getConnection();
  const result = await db.create('user', userData);
  return result[0];
};

/**
 * Find a user by ID
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object or null
 */
const findById = async (userId) => {
  const db = await getConnection();
  try {
    const user = await db.select(new RecordID('user', userId));
    return user;
  } catch (error) {
    console.error(`Error finding user ${userId}:`, error);
    return null;
  }
};

/**
 * Find a user by email
 * 
 * @param {string} email - User email
 * @returns {Promise<Object>} User object or null
 */
const findByEmail = async (email) => {
  const db = await getConnection();
  try {
    const users = await db.query(`SELECT * FROM user WHERE email = $email LIMIT 1`, {
      email
    });
    
    return users[0]?.result?.[0] || null;
  } catch (error) {
    console.error(`Error finding user by email ${email}:`, error);
    return null;
  }
};

/**
 * Update a user
 * 
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (userId, userData) => {
  const db = await getConnection();
  const result = await db.merge(new RecordID('user', userId), userData);
  return result;
};

/**
 * Delete a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const deleteUser = async (userId) => {
  const db = await getConnection();
  await db.delete(new RecordID('user', userId));
  return true;
};

/**
 * List all users
 * 
 * @param {number} limit - Maximum number of users to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of users
 */
const listUsers = async (limit = 100, offset = 0) => {
  const db = await getConnection();
  const users = await db.query(`
    SELECT * FROM user 
    ORDER BY created_at DESC 
    LIMIT $limit 
    START $offset
  `, {
    limit,
    offset
  });
  
  return users[0]?.result || [];
};

module.exports = {
  createUser,
  findById,
  findByEmail,
  updateUser,
  deleteUser,
  listUsers
}; 