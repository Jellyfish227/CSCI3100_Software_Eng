/**
 * Delete course handler
 */
const { success, error } = require('../../utils/response');
const { courses } = require('./list');
const { users } = require('../auth/login');

/**
 * Handle course deletion request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Extract course ID from the path
    const pathParts = event.path.split('/');
    const courseId = pathParts[pathParts.length - 1];
    
    // Find the course
    const courseIndex = courses.findIndex(c => c.id === `course:${courseId}` || c.id === courseId);
    
    // Return 404 if course not found
    if (courseIndex === -1) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Check authorization
    const authHeader = event.headers?.Authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return error(401, 'Authentication Error', 'Invalid or missing authentication token');
    }
    
    // Extract token and decode it
    const token = authHeader.substring(7);
    let userId;
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      userId = decoded.split(':')[0];
    } catch (err) {
      return error(401, 'Authentication Error', 'Invalid authentication token');
    }
    
    // Find the user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return error(401, 'Authentication Error', 'User not found');
    }
    
    // Check if user has permission (only course educator or admin can delete)
    const course = courses[courseIndex];
    if (user.role !== 'admin' && course.educator !== userId) {
      return error(403, 'Authorization Error', 'You do not have permission to delete this course');
    }
    
    // Remove from the array
    courses.splice(courseIndex, 1);
    
    // Return success response
    return success(200, {
      message: "Course deleted successfully"
    });
  } catch (err) {
    console.error('Error in course delete handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 