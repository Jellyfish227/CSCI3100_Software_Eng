/**
 * Course creation handler
 */
const { success, error } = require('../../utils/response');
const { createCourse } = require('../../utils/db');
const { v4: uuidv4 } = require('uuid');
const { requireRole } = require('../../middleware/auth');

/**
 * Handle course creation request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Verify user is an educator
    try {
      event = await requireRole('educator')(event);
    } catch (err) {
      return error(403, 'Authorization Error', err.message);
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'difficulty', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return error(400, 'Bad Request', `Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Generate course ID
    const courseId = uuidv4();
    
    // Create course object
    const course = {
      id: courseId,
      title: body.title,
      description: body.description,
      difficulty: body.difficulty,
      category: body.category,
      educator: event.user.id, // Set educator from authenticated user
      tags: body.tags || [],
      thumbnail: body.thumbnail || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_published: body.is_published ? 'true' : 'false', // Convert boolean to string for DynamoDB
      duration_hours: body.duration_hours || 0,
      students: [],
      rating: 0,
      reviews: [],
      price: body.price || 0
    };
    
    // Create course in DynamoDB
    await createCourse(course);
    
    // Return success response
    return success(201, { 
      message: 'Course created successfully',
      course
    });
  } catch (err) {
    console.error('Error in course creation handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 