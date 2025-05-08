/**
 * Course listing handler
 */
const { success, error } = require('../../utils/response');
const { connectToDatabase } = require('../../utils/db');
const Course = require('../../models/Course');

/**
 * Handle course listing request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 100;
    const offset = parseInt(queryParams.offset) || 0;
    const page = parseInt(queryParams.page) || Math.floor(offset / limit) + 1;
    const publishedOnly = queryParams.published !== 'false'; // Default to true
    const search = queryParams.search || '';
    const educatorId = queryParams.educator || '';
    const category = queryParams.category || '';
    const difficulty = queryParams.difficulty || '';
    
    // Build query
    const query = {};
    
    // Filter by published status if needed
    if (publishedOnly) {
      query.is_published = true;
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter by difficulty if provided
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Filter by educator if provided
    if (educatorId) {
      query.educator = educatorId;
    }
    
    // Add search if provided
    let courseQuery = Course.find(query);
    
    if (search) {
      courseQuery = Course.find({
        $and: [
          query,
          { $text: { $search: search } }
        ]
      }).sort({ score: { $meta: "textScore" } });
    }
    
    // Count total documents for pagination
    const totalDocs = await Course.countDocuments(query);
    
    // Populate educator details
    courseQuery = courseQuery
      .populate('educator', 'name email profile_image bio')
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Execute query
    const courses = await courseQuery.exec();
    
    // Format response
    const formattedCourses = courses.map(course => ({
      id: course._id,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      tags: course.tags,
      educator: {
        id: course.educator._id,
        name: course.educator.name,
        email: course.educator.email,
        profile_image: course.educator.profile_image,
        bio: course.educator.bio
      },
      thumbnail: course.thumbnail,
      created_at: course.created_at,
      updated_at: course.updated_at,
      is_published: course.is_published,
      duration_hours: course.duration_hours,
      category: course.category,
      students: course.students,
      rating: course.rating,
      reviews: course.reviews,
      price: course.price
    }));
    
    // Return success response with courses and pagination info
    return success(200, { 
      courses: formattedCourses,
      pagination: {
        total: totalDocs,
        page,
        limit,
        pages: Math.ceil(totalDocs / limit)
      }
    });
  } catch (err) {
    console.error('Error in course listing handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 