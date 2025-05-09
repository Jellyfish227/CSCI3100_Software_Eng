/**
 * Featured courses handler
 * Returns the most popular published course
 */
const { success, error } = require('../../utils/response');
const { connectToDatabase } = require('../../utils/db');
const Course = require('../../models/Course');

/**
 * Handle featured course request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Find the top published course by student count
    const featuredCourse = await Course.findOne(
      { is_published: true },
      {},
      { 
        sort: { students: -1 },
        populate: {
          path: 'educator',
          select: 'name email profile_image bio'
        }
      }
    );
    
    // Format the response
    let formattedCourse = null;
    
    if (featuredCourse) {
      formattedCourse = {
        id: featuredCourse._id,
        title: featuredCourse.title,
        description: featuredCourse.description,
        difficulty: featuredCourse.difficulty,
        tags: featuredCourse.tags,
        educator: {
          id: featuredCourse.educator._id,
          name: featuredCourse.educator.name,
          email: featuredCourse.educator.email,
          profile_image: featuredCourse.educator.profile_image,
          bio: featuredCourse.educator.bio
        },
        thumbnail: featuredCourse.thumbnail,
        created_at: featuredCourse.created_at,
        updated_at: featuredCourse.updated_at,
        is_published: featuredCourse.is_published,
        duration_hours: featuredCourse.duration_hours,
        category: featuredCourse.category,
        students: featuredCourse.students,
        rating: featuredCourse.rating,
        reviews: featuredCourse.reviews,
        price: featuredCourse.price
      };
    }
    
    // Return success response with a single featured course
    return success(200, { featured_course: formattedCourse });
  } catch (err) {
    console.error('Error in featured course handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler };
