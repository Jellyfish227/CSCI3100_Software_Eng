/**
 * Course content handler
 */
const { success, error } = require('../../utils/response');
const { 
  getCourseById, 
  getCourseContent, 
  createContentEntry, 
  updateContentEntry, 
  deleteContentEntry,
  getContentEntryById
} = require('../../utils/db');
const { v4: uuidv4 } = require('uuid');
const { requireRole, requireOwnership } = require('../../middleware/auth');

/**
 * Get content for a course
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const getContent = async (event) => {
  try {
    const courseId = event.pathParameters?.id;
    if (!courseId) {
      return error(400, 'Bad Request', 'Course ID is required');
    }
    
    // Check if course exists
    const course = await getCourseById(courseId);
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Get course content
    const content = await getCourseContent(courseId);
    
    // Organize content by sections (topics)
    const organizedContent = {};
    
    content.forEach(item => {
      if (!organizedContent[item.topic]) {
        organizedContent[item.topic] = [];
      }
      
      organizedContent[item.topic].push(item);
    });
    
    // Convert to array format for response
    const topics = Object.keys(organizedContent).map(topic => {
      return {
        name: topic,
        entries: organizedContent[topic].sort((a, b) => a.order - b.order)
      };
    });
    
    // Sort topics by the order of their first entry
    topics.sort((a, b) => {
      const aFirstOrder = a.entries[0]?.order || 0;
      const bFirstOrder = b.entries[0]?.order || 0;
      return aFirstOrder - bFirstOrder;
    });
    
    return success(200, {
      courseId,
      topics
    });
  } catch (err) {
    console.error('Error getting course content:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

/**
 * Add content to a course
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const addContent = async (event) => {
  try {
    // Verify user is course owner
    const requireCourseOwnership = requireOwnership(getCourseById, 'id', 'educator');
    try {
      await requireCourseOwnership(event);
    } catch (err) {
      return error(403, 'Authorization Error', err.message);
    }
    
    const courseId = event.pathParameters?.id;
    if (!courseId) {
      return error(400, 'Bad Request', 'Course ID is required');
    }
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.topic || !body.title || !body.type) {
      return error(400, 'Bad Request', 'Topic, title, and type are required');
    }
    
    // Get existing content to determine next order number
    const existingContent = await getCourseContent(courseId);
    const maxOrder = existingContent.reduce((max, item) => Math.max(max, item.order || 0), 0);
    
    // Create content entry
    const contentId = `content:${uuidv4()}`;
    const contentData = {
      id: contentId,
      course_id: courseId,
      topic: body.topic,
      title: body.title,
      type: body.type,
      description: body.description || '',
      content: body.content || '',
      duration_minutes: body.duration_minutes || 0,
      order: maxOrder + 1,
      status: body.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resources: body.resources || []
    };
    
    await createContentEntry(contentData);
    
    return success(201, {
      message: 'Content added successfully',
      content: contentData
    });
  } catch (err) {
    console.error('Error adding course content:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

/**
 * Update course content
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const updateContent = async (event) => {
  try {
    // Verify user is authenticated as educator
    try {
      await requireRole('educator')(event);
    } catch (err) {
      return error(403, 'Authorization Error', err.message);
    }
    
    const contentId = event.pathParameters?.content_id;
    if (!contentId) {
      return error(400, 'Bad Request', 'Content ID is required');
    }
    
    // Get content entry
    const contentEntry = await getContentEntryById(contentId);
    if (!contentEntry) {
      return error(404, 'Not Found', 'Content entry not found');
    }
    
    // Verify user is course owner
    const course = await getCourseById(contentEntry.course_id);
    if (!course || course.educator !== event.user.id) {
      return error(403, 'Authorization Error', 'You do not have permission to update this content');
    }
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Prepare updates object
    const updates = {};
    
    // Fields that can be updated
    const allowedFields = [
      'topic', 'title', 'description', 'content', 
      'duration_minutes', 'order', 'status', 'resources'
    ];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return error(400, 'Bad Request', 'No valid fields provided for update');
    }
    
    // Update content entry
    const updatedContent = await updateContentEntry(contentId, updates);
    
    return success(200, {
      message: 'Content updated successfully',
      content: updatedContent
    });
  } catch (err) {
    console.error('Error updating course content:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

/**
 * Delete course content
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const deleteContent = async (event) => {
  try {
    // Verify user is authenticated as educator
    try {
      await requireRole('educator')(event);
    } catch (err) {
      return error(403, 'Authorization Error', err.message);
    }
    
    const contentId = event.pathParameters?.content_id;
    if (!contentId) {
      return error(400, 'Bad Request', 'Content ID is required');
    }
    
    // Get content entry
    const contentEntry = await getContentEntryById(contentId);
    if (!contentEntry) {
      return error(404, 'Not Found', 'Content entry not found');
    }
    
    // Verify user is course owner
    const course = await getCourseById(contentEntry.course_id);
    if (!course || course.educator !== event.user.id) {
      return error(403, 'Authorization Error', 'You do not have permission to delete this content');
    }
    
    // Delete content entry
    await deleteContentEntry(contentId);
    
    return success(200, {
      message: 'Content deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting course content:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

module.exports = {
  getContent,
  addContent,
  updateContent,
  deleteContent
}; 