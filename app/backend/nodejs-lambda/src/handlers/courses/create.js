/**
 * Create course handler
 */
const { success, error } = require('../../utils/response');
const { users } = require('../auth/login');
const { courses } = require('./list');

/**
 * Handle course creation request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.title || !body.description) {
      return error(400, 'Validation Error', 'Title and description are required');
    }
    
    // In a real app, we would extract the user ID from the JWT token
    // For now, we'll use a mock authentication check
    const authHeader = event.headers?.Authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return error(401, 'Authentication Error', 'Invalid or missing authentication token');
    }
    
    // Extract token and decode it
    const token = authHeader.substring(7);
    let userId;
    try {
      // In a real app, this would validate the JWT
      // For now, we'll just decode the base64 token from the login handler
      const decoded = Buffer.from(token, 'base64').toString();
      userId = decoded.split(':')[0];
    } catch (err) {
      return error(401, 'Authentication Error', 'Invalid authentication token');
    }
    
    // Check if the user exists and is an educator or admin
    const user = users.find(u => u.id === userId);
    if (!user || (user.role !== 'educator' && user.role !== 'admin')) {
      return error(403, 'Authorization Error', 'Only educators and admins can create courses');
    }
    
    // Create course object
    const courseId = `course:${courses.length + 1}`;
    const courseData = {
      id: courseId,
      title: body.title,
      description: body.description,
      difficulty: body.difficulty || 'beginner',
      tags: body.tags || [],
      educator: userId,
      thumbnail: body.thumbnail_url || 'https://example.com/default-thumbnail.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_published: body.is_published !== undefined ? body.is_published : false,
      duration_hours: body.duration_hours || 0,
    };
    
    // Add to mock courses array
    courses.push(courseData);
    
    // Return success response
    return success(201, {
      message: "Course created successfully",
      course: courseData
    });
  } catch (err) {
    console.error('Error in create course handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 