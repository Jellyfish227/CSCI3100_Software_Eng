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
const ENROLLMENTS_TABLE = process.env.ENROLLMENTS_TABLE || 'kaiju-enrollments';
const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE || 'kaiju-assignments';
const SUBMISSIONS_TABLE = process.env.SUBMISSIONS_TABLE || 'kaiju-submissions';
const ASSESSMENTS_TABLE = process.env.ASSESSMENTS_TABLE || 'kaiju-assessments';
const ASSESSMENT_RESULTS_TABLE = process.env.ASSESSMENT_RESULTS_TABLE || 'kaiju-assessment-results';
const FILES_TABLE = process.env.FILES_TABLE || 'kaiju-files';

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

/**
 * Enroll a student in a course
 * @param {object} enrollmentData - Enrollment data
 * @returns {Promise<object>} Created enrollment
 */
const createEnrollment = async (enrollmentData) => {
  const params = {
    TableName: ENROLLMENTS_TABLE,
    Item: {
      ...enrollmentData,
      enrolled_at: new Date().toISOString(),
      progress: 0,
      status: 'active'
    },
    ConditionExpression: 'attribute_not_exists(id)'
  };
  
  await docClient.send(new PutCommand(params));
  return params.Item;
};

/**
 * Get enrollments by student ID
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} List of enrollments
 */
const getEnrollmentsByStudent = async (studentId) => {
  const params = {
    TableName: ENROLLMENTS_TABLE,
    IndexName: 'StudentIndex',
    KeyConditionExpression: 'student_id = :studentId',
    ExpressionAttributeValues: {
      ':studentId': studentId
    }
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
};

/**
 * Get enrollment by course and student
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student ID
 * @returns {Promise<object>} Enrollment object
 */
const getEnrollment = async (courseId, studentId) => {
  const params = {
    TableName: ENROLLMENTS_TABLE,
    IndexName: 'CourseStudentIndex',
    KeyConditionExpression: 'course_id = :courseId AND student_id = :studentId',
    ExpressionAttributeValues: {
      ':courseId': courseId,
      ':studentId': studentId
    }
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items?.[0];
};

/**
 * Update enrollment status
 * @param {string} id - Enrollment ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated enrollment
 */
const updateEnrollment = async (id, updates) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });
  
  const params = {
    TableName: ENROLLMENTS_TABLE,
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
 * Delete enrollment
 * @param {string} id - Enrollment ID
 * @returns {Promise<boolean>} Success status
 */
const deleteEnrollment = async (id) => {
  const params = {
    TableName: ENROLLMENTS_TABLE,
    Key: { id }
  };
  
  await docClient.send(new DeleteCommand(params));
  return true;
};

/**
 * Create a new assignment
 * @param {object} assignmentData - Assignment data
 * @returns {Promise<object>} Created assignment
 */
const createAssignment = async (assignmentData) => {
  const params = {
    TableName: ASSIGNMENTS_TABLE,
    Item: {
      ...assignmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
  
  await docClient.send(new PutCommand(params));
  return params.Item;
};

/**
 * Get assignment by ID
 * @param {string} id - Assignment ID
 * @returns {Promise<object>} Assignment object
 */
const getAssignmentById = async (id) => {
  const params = {
    TableName: ASSIGNMENTS_TABLE,
    Key: { id }
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

/**
 * Get assignments by course ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} List of assignments
 */
const getAssignmentsByCourse = async (courseId) => {
  const params = {
    TableName: ASSIGNMENTS_TABLE,
    IndexName: 'CourseIndex',
    KeyConditionExpression: 'course_id = :courseId',
    ExpressionAttributeValues: {
      ':courseId': courseId
    }
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
};

/**
 * Update assignment
 * @param {string} id - Assignment ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated assignment
 */
const updateAssignment = async (id, updates) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  // Always update the updated_at timestamp
  updates.updated_at = new Date().toISOString();
  
  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });
  
  const params = {
    TableName: ASSIGNMENTS_TABLE,
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
 * Delete assignment
 * @param {string} id - Assignment ID
 * @returns {Promise<boolean>} Success status
 */
const deleteAssignment = async (id) => {
  const params = {
    TableName: ASSIGNMENTS_TABLE,
    Key: { id }
  };
  
  await docClient.send(new DeleteCommand(params));
  return true;
};

/**
 * Submit assignment
 * @param {object} submissionData - Submission data
 * @returns {Promise<object>} Created submission
 */
const createSubmission = async (submissionData) => {
  const params = {
    TableName: SUBMISSIONS_TABLE,
    Item: {
      ...submissionData,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
      grade: null,
      feedback: null
    }
  };
  
  await docClient.send(new PutCommand(params));
  return params.Item;
};

/**
 * Get submission by ID
 * @param {string} id - Submission ID
 * @returns {Promise<object>} Submission object
 */
const getSubmissionById = async (id) => {
  const params = {
    TableName: SUBMISSIONS_TABLE,
    Key: { id }
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

/**
 * Get submissions by assignment and student
 * @param {string} assignmentId - Assignment ID
 * @param {string} studentId - Student ID (optional)
 * @returns {Promise<Array>} List of submissions
 */
const getSubmissionsByAssignment = async (assignmentId, studentId = null) => {
  let params = {
    TableName: SUBMISSIONS_TABLE,
    IndexName: 'AssignmentIndex',
    KeyConditionExpression: 'assignment_id = :assignmentId',
    ExpressionAttributeValues: {
      ':assignmentId': assignmentId
    }
  };
  
  if (studentId) {
    params = {
      ...params,
      FilterExpression: 'student_id = :studentId',
      ExpressionAttributeValues: {
        ...params.ExpressionAttributeValues,
        ':studentId': studentId
      }
    };
  }
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
};

/**
 * Grade assignment submission
 * @param {string} id - Submission ID
 * @param {object} gradeData - Grade data
 * @returns {Promise<object>} Updated submission
 */
const gradeSubmission = async (id, gradeData) => {
  const { grade, feedback, gradedBy } = gradeData;
  
  const params = {
    TableName: SUBMISSIONS_TABLE,
    Key: { id },
    UpdateExpression: 'SET #grade = :grade, #feedback = :feedback, #status = :status, #graded_at = :graded_at, #graded_by = :graded_by',
    ExpressionAttributeNames: {
      '#grade': 'grade',
      '#feedback': 'feedback',
      '#status': 'status',
      '#graded_at': 'graded_at',
      '#graded_by': 'graded_by'
    },
    ExpressionAttributeValues: {
      ':grade': grade,
      ':feedback': feedback || null,
      ':status': 'graded',
      ':graded_at': new Date().toISOString(),
      ':graded_by': gradedBy
    },
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
};

/**
 * Create a new assessment
 * @param {object} assessmentData - Assessment data
 * @returns {Promise<object>} Created assessment
 */
const createAssessment = async (assessmentData) => {
  const params = {
    TableName: ASSESSMENTS_TABLE,
    Item: {
      ...assessmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
  
  await docClient.send(new PutCommand(params));
  return params.Item;
};

/**
 * Get assessment by ID
 * @param {string} id - Assessment ID
 * @returns {Promise<object>} Assessment object
 */
const getAssessmentById = async (id) => {
  const params = {
    TableName: ASSESSMENTS_TABLE,
    Key: { id }
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

/**
 * Get assessments by course ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} List of assessments
 */
const getAssessmentsByCourse = async (courseId) => {
  const params = {
    TableName: ASSESSMENTS_TABLE,
    IndexName: 'CourseIndex',
    KeyConditionExpression: 'course_id = :courseId',
    ExpressionAttributeValues: {
      ':courseId': courseId
    }
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
};

/**
 * Submit assessment result
 * @param {object} resultData - Assessment result data
 * @returns {Promise<object>} Created assessment result
 */
const submitAssessmentResult = async (resultData) => {
  const params = {
    TableName: ASSESSMENT_RESULTS_TABLE,
    Item: {
      ...resultData,
      submitted_at: new Date().toISOString()
    }
  };
  
  await docClient.send(new PutCommand(params));
  return params.Item;
};

/**
 * Get assessment results by student
 * @param {string} studentId - Student ID
 * @param {string} assessmentId - Assessment ID (optional)
 * @returns {Promise<Array>} List of assessment results
 */
const getAssessmentResultsByStudent = async (studentId, assessmentId = null) => {
  let params = {
    TableName: ASSESSMENT_RESULTS_TABLE,
    IndexName: 'StudentIndex',
    KeyConditionExpression: 'student_id = :studentId',
    ExpressionAttributeValues: {
      ':studentId': studentId
    }
  };
  
  if (assessmentId) {
    params = {
      ...params,
      FilterExpression: 'assessment_id = :assessmentId',
      ExpressionAttributeValues: {
        ...params.ExpressionAttributeValues,
        ':assessmentId': assessmentId
      }
    };
  }
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
};

/**
 * Upload file metadata to DynamoDB
 * @param {object} fileData - File metadata
 * @returns {Promise<object>} Created file entry
 */
const createFile = async (fileData) => {
  const params = {
    TableName: FILES_TABLE,
    Item: {
      ...fileData,
      uploaded_at: new Date().toISOString()
    }
  };
  
  await docClient.send(new PutCommand(params));
  return params.Item;
};

/**
 * Get file by ID
 * @param {string} id - File ID
 * @returns {Promise<object>} File object
 */
const getFileById = async (id) => {
  const params = {
    TableName: FILES_TABLE,
    Key: { id }
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

/**
 * Get files by related entity
 * @param {string} relatedId - ID of related entity
 * @param {string} type - File type (optional)
 * @returns {Promise<Array>} List of files
 */
const getFilesByRelatedId = async (relatedId, type = null) => {
  let params = {
    TableName: FILES_TABLE,
    IndexName: 'RelatedIdIndex',
    KeyConditionExpression: 'related_id = :relatedId',
    ExpressionAttributeValues: {
      ':relatedId': relatedId
    }
  };
  
  if (type) {
    params = {
      ...params,
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ...params.ExpressionAttributeValues,
        ':type': type
      }
    };
  }
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
};

/**
 * Delete file
 * @param {string} id - File ID
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (id) => {
  const params = {
    TableName: FILES_TABLE,
    Key: { id }
  };
  
  await docClient.send(new DeleteCommand(params));
  return true;
};

/**
 * Update course progress for a student
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} contentId - Content ID
 * @param {boolean} completed - Completion status
 * @returns {Promise<object>} Updated enrollment with progress
 */
const updateCourseProgress = async (enrollmentId, contentId, completed) => {
  // First, get the enrollment
  const params = {
    TableName: ENROLLMENTS_TABLE,
    Key: { id: enrollmentId }
  };
  
  const result = await docClient.send(new GetCommand(params));
  const enrollment = result.Item;
  
  if (!enrollment) {
    throw new Error('Enrollment not found');
  }
  
  // Update the completed_content array and overall progress
  const completedContent = enrollment.completed_content || [];
  
  if (completed && !completedContent.includes(contentId)) {
    completedContent.push(contentId);
  } else if (!completed && completedContent.includes(contentId)) {
    const index = completedContent.indexOf(contentId);
    completedContent.splice(index, 1);
  }
  
  // Get the course content to calculate progress
  const courseContent = await getCourseContent(enrollment.course_id);
  const overallProgress = courseContent.length > 0 
    ? Math.round((completedContent.length / courseContent.length) * 100)
    : 0;
  
  // Update the enrollment with new progress information
  const updateParams = {
    TableName: ENROLLMENTS_TABLE,
    Key: { id: enrollmentId },
    UpdateExpression: 'SET #progress = :progress, #completed_content = :completed_content, #last_accessed = :last_accessed',
    ExpressionAttributeNames: {
      '#progress': 'progress',
      '#completed_content': 'completed_content',
      '#last_accessed': 'last_accessed'
    },
    ExpressionAttributeValues: {
      ':progress': overallProgress,
      ':completed_content': completedContent,
      ':last_accessed': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };
  
  const updateResult = await docClient.send(new UpdateCommand(updateParams));
  return updateResult.Attributes;
};

module.exports = {
  docClient,
  USERS_TABLE,
  COURSES_TABLE,
  COURSE_CONTENT_TABLE,
  ENROLLMENTS_TABLE,
  ASSIGNMENTS_TABLE,
  SUBMISSIONS_TABLE,
  ASSESSMENTS_TABLE,
  ASSESSMENT_RESULTS_TABLE,
  FILES_TABLE,
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
  getContentEntriesByIds,
  createEnrollment,
  getEnrollmentsByStudent,
  getEnrollment,
  updateEnrollment,
  deleteEnrollment,
  createAssignment,
  getAssignmentById,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
  createSubmission,
  getSubmissionById,
  getSubmissionsByAssignment,
  gradeSubmission,
  createAssessment,
  getAssessmentById,
  getAssessmentsByCourse,
  submitAssessmentResult,
  getAssessmentResultsByStudent,
  createFile,
  getFileById,
  getFilesByRelatedId,
  deleteFile,
  updateCourseProgress
}; 