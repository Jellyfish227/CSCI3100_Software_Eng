/**
 * Featured courses handler
 * Returns the most popular published course
 */
const { success, error } = require('../../utils/response');
const { listCourses } = require('../../utils/db');

/**
 * Handle featured course request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Get all published courses
    const courses = await listCourses({
      FilterExpression: 'is_published = :published',
      ExpressionAttributeValues: {
        ':published': true
      }
    });
    
    // Find the course with the most students
    const featuredCourse = courses.length > 0
      ? courses.sort((a, b) => (b.students || 0) - (a.students || 0))[0]
      : null;
    
    // Return success response with a single featured course
    return success(200, { featured_course: featuredCourse || null });
  } catch (err) {
    console.error('Error in featured course handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler };
