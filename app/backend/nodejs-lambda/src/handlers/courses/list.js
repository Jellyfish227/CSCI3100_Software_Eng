/**
 * Course listing handler
 */
const { success, error } = require('../../utils/response');
const { listCourses } = require('../../utils/db');

/**
 * Handle course listing request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
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
    
    // Build filter expression
    let filterExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    
    if (publishedOnly) {
      filterExpressions.push('#is_published = :is_published');
      expressionAttributeNames['#is_published'] = 'is_published';
      expressionAttributeValues[':is_published'] = 'true';
    }
    
    if (category) {
      filterExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = category;
    }
    
    if (difficulty) {
      filterExpressions.push('#difficulty = :difficulty');
      expressionAttributeNames['#difficulty'] = 'difficulty';
      expressionAttributeValues[':difficulty'] = difficulty;
    }
    
    if (educatorId) {
      filterExpressions.push('#educator = :educator');
      expressionAttributeNames['#educator'] = 'educator';
      expressionAttributeValues[':educator'] = educatorId;
    }
    
    // Build DynamoDB query parameters
    const dynamoParams = {
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: limit
    };
    
    // Execute query
    const courses = await listCourses(dynamoParams);
    
    // Apply search filter if provided
    let filteredCourses = courses;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) || 
        course.description.toLowerCase().includes(searchLower) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + limit);
    
    // Return success response with courses and pagination info
    return success(200, { 
      courses: paginatedCourses,
      pagination: {
        total: filteredCourses.length,
        page,
        limit,
        pages: Math.ceil(filteredCourses.length / limit)
      }
    });
  } catch (err) {
    console.error('Error in course listing handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = { handler }; 