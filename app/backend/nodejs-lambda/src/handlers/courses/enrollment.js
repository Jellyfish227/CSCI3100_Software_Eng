/**
 * Course enrollment handlers
 */
const { v4: uuidv4 } = require('uuid');
const { 
  createEnrollment, 
  getEnrollment, 
  getEnrollmentsByStudent, 
  deleteEnrollment, 
  getCourseById,
  updateCourseProgress,
  getContentEntryById
} = require('../../utils/db');
const { success, error } = require('../../utils/response');

/**
 * Enroll a student in a course
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const enroll = async (event) => {
  try {
    const { id: courseId } = event.pathParameters || {};
    const { id: studentId, role } = event.user || {};
    
    // Validate user authentication
    if (!studentId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Validate student role
    if (role !== 'student') {
      return error(403, 'Forbidden', 'Only students can enroll in courses');
    }
    
    // Check if the course exists
    const course = await getCourseById(courseId);
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Check if course is published
    if (!course.is_published) {
      return error(400, 'Bad Request', 'Cannot enroll in unpublished course');
    }
    
    // Check if already enrolled
    const existingEnrollment = await getEnrollment(courseId, studentId);
    if (existingEnrollment) {
      return error(400, 'Bad Request', 'Already enrolled in this course');
    }
    
    // Create enrollment
    const enrollment = await createEnrollment({
      id: `enrollment:${uuidv4()}`,
      course_id: courseId,
      student_id: studentId,
      completed_content: [],
      progress: 0,
      status: 'active'
    });
    
    return success(200, {
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (err) {
    console.error('Error enrolling in course:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Unenroll a student from a course
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const unenroll = async (event) => {
  try {
    const { id: courseId } = event.pathParameters || {};
    const { id: studentId } = event.user || {};
    
    // Validate user authentication
    if (!studentId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Check if enrolled
    const enrollment = await getEnrollment(courseId, studentId);
    if (!enrollment) {
      return error(404, 'Not Found', 'Not enrolled in this course');
    }
    
    // Delete enrollment
    await deleteEnrollment(enrollment.id);
    
    return success(200, {
      message: 'Successfully unenrolled from course'
    });
  } catch (err) {
    console.error('Error unenrolling from course:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Get student's enrolled courses
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const getEnrolledCourses = async (event) => {
  try {
    const { id: studentId } = event.user || {};
    
    // Validate user authentication
    if (!studentId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Get all enrollments for the student
    const enrollments = await getEnrollmentsByStudent(studentId);
    
    // Get course details for each enrollment
    const coursesPromises = enrollments.map(async (enrollment) => {
      const course = await getCourseById(enrollment.course_id);
      if (!course) return null;
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        educator: course.educator,
        enrollment: {
          id: enrollment.id,
          enrolled_at: enrollment.enrolled_at,
          progress: enrollment.progress,
          status: enrollment.status,
          last_accessed: enrollment.last_accessed
        },
        thumbnail: course.thumbnail
      };
    });
    
    const courses = (await Promise.all(coursesPromises)).filter(Boolean);
    
    return success(200, { courses });
  } catch (err) {
    console.error('Error getting enrolled courses:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Update course progress
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const updateProgress = async (event) => {
  try {
    const { id: courseId } = event.pathParameters || {};
    const { id: studentId } = event.user || {};
    const { content_id: contentId, completed } = JSON.parse(event.body);
    
    // Validate user authentication
    if (!studentId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Validate input
    if (!contentId) {
      return error(400, 'Bad Request', 'Content ID is required');
    }
    
    // Check if content exists
    const content = await getContentEntryById(contentId);
    if (!content) {
      return error(404, 'Not Found', 'Content not found');
    }
    
    // Check if content belongs to the course
    if (content.course_id !== courseId) {
      return error(400, 'Bad Request', 'Content does not belong to this course');
    }
    
    // Check if enrolled
    const enrollment = await getEnrollment(courseId, studentId);
    if (!enrollment) {
      return error(404, 'Not Found', 'Not enrolled in this course');
    }
    
    // Update progress
    const updatedEnrollment = await updateCourseProgress(enrollment.id, contentId, completed);
    
    return success(200, {
      message: 'Progress updated',
      progress: {
        course_id: courseId,
        student_id: studentId,
        overall_progress: updatedEnrollment.progress,
        completed_content: updatedEnrollment.completed_content,
        last_accessed: updatedEnrollment.last_accessed
      }
    });
  } catch (err) {
    console.error('Error updating progress:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

module.exports = {
  enroll,
  unenroll,
  getEnrolledCourses,
  updateProgress
}; 