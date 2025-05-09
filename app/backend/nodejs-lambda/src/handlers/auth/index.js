/**
 * Auth handlers index file
 * Exports all authentication related handlers
 */

const login = require('./login');
const register = require('./register');
const validate = require('./validate');

module.exports = {
  login,
  register,
  validate
}; 