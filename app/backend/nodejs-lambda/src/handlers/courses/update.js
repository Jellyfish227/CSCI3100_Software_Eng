/**
 * Course update handler
 */
const { success, error } = require('../../utils/response');
const { getCourseById, updateCourse } = require('../../utils/db');
const { requireOwnership } = require('../../middleware/auth');

/**
 * Handle course update request
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
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Get existing course
    const courseId = event.pathParameters.id;
    const existingCourse = await getCourseById(courseId);
    
    if (!existingCourse) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Prepare update data (excluding key attributes)
    const updateData = { ...body };
    
    // Remove key attribute to avoid DynamoDB error
    delete updateData.id;
    
    // Ensure we preserve the educator and add updated timestamp
    updateData.educator = existingCourse.educator;
    updateData.updated_at = new Date().toISOString();
    
    // Update course in DynamoDB
    const updatedCourse = await updateCourse(courseId, updateData);
    
    // Return success response
    return success(200, { 
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (err) {
    console.error('Error in course update handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 