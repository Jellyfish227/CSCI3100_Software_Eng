/**
 * Response utility functions for consistent API responses
 */

/**
 * Create a formatted success response
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response data to send
 * @returns {object} Formatted Lambda response
 */
const success = (statusCode, data) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
};

/**
 * Create a formatted error response
 * @param {number} statusCode - HTTP status code
 * @param {string} errorType - Type of error
 * @param {string} message - Error message
 * @returns {object} Formatted Lambda response
 */
const error = (statusCode, errorType, message) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: {
        type: errorType,
        message
      }
    })
  };
};

module.exports = {
  success,
  error
}; 