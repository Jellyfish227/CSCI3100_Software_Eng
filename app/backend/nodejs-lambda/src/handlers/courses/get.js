/**
 * Course get handler
 */
const { success, error } = require('../../utils/response');
const { getCourseById } = require('../../utils/db');

/**
 * Handle course get request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Extract course ID from path parameters
    const courseId = event.pathParameters?.id;
    
    if (!courseId) {
      return error(400, 'Bad Request', 'Course ID is required');
    }
    
    // Get course from DynamoDB
    const course = await getCourseById(courseId);
    
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Return success response
    return success(200, { course });
  } catch (err) {
    console.error('Error in course get handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 