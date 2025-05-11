/**
 * DynamoDB utility functions
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  QueryCommand, 
  ScanCommand, 
  UpdateCommand, 
  DeleteCommand,
  BatchGetCommand
} = require('@aws-sdk/lib-dynamodb');

// Create DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Table names
const USERS_TABLE = process.env.USERS_TABLE || 'kaiju-users';
const COURSES_TABLE = process.env.COURSES_TABLE || 'kaiju-courses';
const COURSE_CONTENT_TABLE = process.env.COURSE_CONTENT_TABLE || 'kaiju-course-content';

/**
 * Get a user by ID
 * @param {string} id - User ID
 * @returns {Promise<object>} User object
 */
const getUserById = async (id) => {
  const params = {
    TableName: USERS_TABLE,
    Key: { id }
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

/**
 * Get a user by email
 * @param {string} email - User email
 * @returns {Promise<object>} User object
 */
const getUserByEmail = async (email) => {
  const params = {
    TableName: USERS_TABLE,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items[0];
};

/**
 * Create a new user
 * @param {object} userData - User data
 * @returns {Promise<object>} Created user
 */
const createUser = async (userData) => {
  const params = {
    TableName: USERS_TABLE,
    Item: userData
  };
  
  await docClient.send(new PutCommand(params));
  return userData;
};

/**
 * Update a user
 * @param {string} id - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated user
 */
const updateUser = async (id, updates) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });
  
  const params = {
    TableName: USERS_TABLE,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
};

/**
 * Get a course by ID
 * @param {string} id - Course ID
 * @returns {Promise<object>} Course object
 */
const getCourseById = async (id) => {
  const params = {
    TableName: COURSES_TABLE,
    Key: { id }
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

/**
 * List courses with filters
 * @param {object} filters - Query filters
 * @returns {Promise<Array>} List of courses
 */
const listCourses = async (filters = {}) => {
  const params = {
    TableName: COURSES_TABLE,
    ...filters
  };
  
  const result = await docClient.send(new ScanCommand(params));
  return result.Items;
};

/**
 * Create a new course
 * @param {object} courseData - Course data
 * @returns {Promise<object>} Created course
 */
const createCourse = async (courseData) => {
  const params = {
    TableName: COURSES_TABLE,
    Item: courseData
  };
  
  await docClient.send(new PutCommand(params));
  return courseData;
};

/**
 * Update a course
 * @param {string} id - Course ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated course
 */
const updateCourse = async (id, updates) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });
  
  const params = {
    TableName: COURSES_TABLE,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
};

/**
 * Delete a course
 * @param {string} id - Course ID
 * @returns {Promise<boolean>} Success status
 */
const deleteCourse = async (id) => {
  const params = {
    TableName: COURSES_TABLE,
    Key: { id }
  };
  
  await docClient.send(new DeleteCommand(params));
  return true;
};

/**
 * Get a course content entry by ID
 * @param {string} id - Content entry ID
 * @returns {Promise<object>} Content entry object
 */
const getContentEntryById = async (id) => {
  const params = {
    TableName: COURSE_CONTENT_TABLE,
    Key: { id }
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

/**
 * Get course content by course ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} Course content entries
 */
const getCourseContent = async (courseId) => {
  const params = {
    TableName: COURSE_CONTENT_TABLE,
    IndexName: 'CourseIndex',
    KeyConditionExpression: 'course_id = :courseId',
    ExpressionAttributeValues: {
      ':courseId': courseId
    }
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items;
};

/**
 * Create a new course content entry
 * @param {object} contentData - Content data
 * @returns {Promise<object>} Created content entry
 */
const createContentEntry = async (contentData) => {
  const params = {
    TableName: COURSE_CONTENT_TABLE,
    Item: contentData
  };
  
  await docClient.send(new PutCommand(params));
  return contentData;
};

/**
 * Update a course content entry
 * @param {string} id - Content entry ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated content entry
 */
const updateContentEntry = async (id, updates) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });
  
  const params = {
    TableName: COURSE_CONTENT_TABLE,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
};

/**
 * Delete a course content entry
 * @param {string} id - Content entry ID
 * @returns {Promise<boolean>} Success status
 */
const deleteContentEntry = async (id) => {
  const params = {
    TableName: COURSE_CONTENT_TABLE,
    Key: { id }
  };
  
  await docClient.send(new DeleteCommand(params));
  return true;
};

/**
 * Get content entries by IDs
 * @param {Array<string>} ids - Content entry IDs
 * @returns {Promise<Array<object>>} Content entries
 */
const getContentEntriesByIds = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  
  const params = {
    RequestItems: {
      [COURSE_CONTENT_TABLE]: {
        Keys: ids.map(id => ({ id }))
      }
    }
  };
  
  const result = await docClient.send(new BatchGetCommand(params));
  return result.Responses?.[COURSE_CONTENT_TABLE] || [];
};

module.exports = {
  docClient,
  USERS_TABLE,
  COURSES_TABLE,
  COURSE_CONTENT_TABLE,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  getCourseById,
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getContentEntryById,
  getCourseContent,
  createContentEntry,
  updateContentEntry,
  deleteContentEntry,
  getContentEntriesByIds
}; 