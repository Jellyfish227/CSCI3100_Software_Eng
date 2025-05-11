/**
 * Course assignments handlers
 */
const { v4: uuidv4 } = require('uuid');
const { 
  createAssignment,
  getAssignmentById,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
  getCourseById,
  getEnrollment,
  createSubmission,
  getSubmissionById,
  getSubmissionsByAssignment,
  gradeSubmission
} = require('../../utils/db');
const { success, error } = require('../../utils/response');

/**
 * Create a new assignment
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const create = async (event) => {
  try {
    const { id: courseId } = event.pathParameters || {};
    const { id: educatorId, role } = event.user || {};
    
    // Validate user authentication
    if (!educatorId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    const assignmentData = JSON.parse(event.body);
    
    // Validate educator role
    if (role !== 'educator' && role !== 'admin') {
      return error(403, 'Forbidden', 'Only educators can create assignments');
    }
    
    // Check if the course exists
    const course = await getCourseById(courseId);
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Check if user is the course owner
    if (course.educator.id !== educatorId && role !== 'admin') {
      return error(403, 'Forbidden', 'Only course owner can create assignments');
    }
    
    // Create assignment
    const assignment = await createAssignment({
      id: `assignment:${uuidv4()}`,
      course_id: courseId,
      title: assignmentData.title,
      description: assignmentData.description,
      due_date: assignmentData.due_date,
      points: assignmentData.points,
      content: assignmentData.content,
      attachment_urls: assignmentData.attachment_urls || [],
      related_content_ids: assignmentData.related_content_ids || []
    });
    
    return success(201, {
      message: 'Assignment created successfully',
      assignment
    });
  } catch (err) {
    console.error('Error creating assignment:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Get assignments for a course
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const getByCourse = async (event) => {
  try {
    const { id: courseId } = event.pathParameters || {};
    const { id: userId, role } = event.user || {};
    
    // Validate user authentication
    if (!userId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Check if the course exists
    const course = await getCourseById(courseId);
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // If user is not educator or admin, check if enrolled
    if (role !== 'educator' && role !== 'admin' && course.educator.id !== userId) {
      const enrollment = await getEnrollment(courseId, userId);
      if (!enrollment) {
        return error(403, 'Forbidden', 'You must be enrolled in this course to view assignments');
      }
    }
    
    // Get all assignments for the course
    const assignments = await getAssignmentsByCourse(courseId);
    
    // If student, add submission status to each assignment
    if (role === 'student') {
      const assignmentsWithSubmission = await Promise.all(assignments.map(async (assignment) => {
        const submissions = await getSubmissionsByAssignment(assignment.id, userId);
        const submissionStatus = submissions.length > 0 
          ? submissions[0].status 
          : 'not_submitted';
        
        return {
          ...assignment,
          submission_status: submissionStatus
        };
      }));
      
      return success(200, { assignments: assignmentsWithSubmission });
    }
    
    return success(200, { assignments });
  } catch (err) {
    console.error('Error getting assignments:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Get assignment details
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const getById = async (event) => {
  try {
    const { assignment_id: assignmentId } = event.pathParameters || {};
    const { id: userId, role } = event.user || {};
    
    // Validate user authentication
    if (!userId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Get the assignment
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) {
      return error(404, 'Not Found', 'Assignment not found');
    }
    
    // Get the course
    const course = await getCourseById(assignment.course_id);
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // If user is not educator or admin, check if enrolled
    if (role !== 'educator' && role !== 'admin' && course.educator.id !== userId) {
      const enrollment = await getEnrollment(assignment.course_id, userId);
      if (!enrollment) {
        return error(403, 'Forbidden', 'You must be enrolled in this course to view assignments');
      }
    }
    
    return success(200, { assignment });
  } catch (err) {
    console.error('Error getting assignment:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Submit an assignment
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const submit = async (event) => {
  try {
    const { assignment_id: assignmentId } = event.pathParameters || {};
    const { id: studentId, role } = event.user || {};
    
    // Validate user authentication
    if (!studentId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    const submissionData = JSON.parse(event.body);
    
    // Validate student role
    if (role !== 'student') {
      return error(403, 'Forbidden', 'Only students can submit assignments');
    }
    
    // Get the assignment
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) {
      return error(404, 'Not Found', 'Assignment not found');
    }
    
    // Check if enrolled in course
    const enrollment = await getEnrollment(assignment.course_id, studentId);
    if (!enrollment) {
      return error(403, 'Forbidden', 'You must be enrolled in this course to submit assignments');
    }
    
    // Check if assignment is past due date
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    
    let isLate = false;
    if (now > dueDate) {
      isLate = true;
    }
    
    // Create submission
    const submission = await createSubmission({
      id: `submission:${uuidv4()}`,
      assignment_id: assignmentId,
      student_id: studentId,
      submission_text: submissionData.submission_text,
      attachment_urls: submissionData.attachment_urls || [],
      is_late: isLate
    });
    
    return success(201, {
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (err) {
    console.error('Error submitting assignment:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Grade an assignment submission
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const grade = async (event) => {
  try {
    const { assignment_id: assignmentId, submission_id: submissionId } = event.pathParameters || {};
    const { id: educatorId, role } = event.user || {};
    
    // Validate user authentication
    if (!educatorId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    const gradeData = JSON.parse(event.body);
    
    // Validate grade
    if (gradeData.grade === undefined || gradeData.grade === null) {
      return error(400, 'Bad Request', 'Grade is required');
    }
    
    // Validate educator role
    if (role !== 'educator' && role !== 'admin') {
      return error(403, 'Forbidden', 'Only educators can grade assignments');
    }
    
    // Get the assignment and submission
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) {
      return error(404, 'Not Found', 'Assignment not found');
    }
    
    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      return error(404, 'Not Found', 'Submission not found');
    }
    
    // Check if submission belongs to the assignment
    if (submission.assignment_id !== assignmentId) {
      return error(400, 'Bad Request', 'Submission does not belong to this assignment');
    }
    
    // Get the course
    const course = await getCourseById(assignment.course_id);
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Check if user is the course owner
    if (course.educator.id !== educatorId && role !== 'admin') {
      return error(403, 'Forbidden', 'Only course owner can grade assignments');
    }
    
    // Grade the submission
    const gradedSubmission = await gradeSubmission(submissionId, {
      grade: gradeData.grade,
      feedback: gradeData.feedback,
      gradedBy: educatorId
    });
    
    return success(200, {
      message: 'Submission graded successfully',
      submission: gradedSubmission
    });
  } catch (err) {
    console.error('Error grading submission:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

module.exports = {
  create,
  getByCourse,
  getById,
  submit,
  grade
}; 