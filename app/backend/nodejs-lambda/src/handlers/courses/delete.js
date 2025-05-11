/**
 * Course delete handler
 */
const { success, error } = require('../../utils/response');
const { getCourseById, deleteCourse } = require('../../utils/db');
const { requireOwnership } = require('../../middleware/auth');

/**
 * Handle course delete request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Verify user owns the course
    try {
      event = await requireOwnership(getCourseById)(event);
    } catch (err) {
      return error(403, 'Authorization Error', err.message);
    }
    
    // Delete course from DynamoDB
    await deleteCourse(event.pathParameters.id);
    
    // Return success response
    return success(200, { 
      message: 'Course deleted successfully'
    });
  } catch (err) {
    console.error('Error in course delete handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 