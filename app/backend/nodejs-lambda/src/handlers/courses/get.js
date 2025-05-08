/**
 * Get course details handler
 */
const { success, error } = require('../../utils/response');
const { courses } = require('./list');

/**
 * Handle course get request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Extract course ID from the path
    const pathParts = event.path.split('/');
    const courseId = pathParts[pathParts.length - 1];
    
    // Find the course
    const course = courses.find(c => c.id === `course:${courseId}` || c.id === courseId);
    
    // Return 404 if course not found
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Return success response with course
    return success(200, { course });
  } catch (err) {
    console.error('Error in course get handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 