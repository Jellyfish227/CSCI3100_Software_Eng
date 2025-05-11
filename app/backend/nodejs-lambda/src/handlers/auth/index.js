/**
 * Auth handlers index file
 * Exports all authentication related handlers
 */

const login = require('./login');
const register = require('./register');
const validate = require('./validate');
const updateProfile = require('./update-profile');
const getUser = require('./get-user');

module.exports = {
  login,
  register,
  validate,
  updateProfile,
  getUser
}; 