/**
 * Course assessments (quizzes) handlers
 */
const { v4: uuidv4 } = require('uuid');
const { 
  createAssessment,
  getAssessmentById,
  getAssessmentsByCourse,
  getCourseById,
  getEnrollment,
  submitAssessmentResult,
  getAssessmentResultsByStudent
} = require('../../utils/db');
const { success, error } = require('../../utils/response');

/**
 * Create a new assessment
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
    
    const assessmentData = JSON.parse(event.body);
    
    // Validate educator role
    if (role !== 'educator' && role !== 'admin') {
      return error(403, 'Forbidden', 'Only educators can create assessments');
    }
    
    // Check if the course exists
    const course = await getCourseById(courseId);
    if (!course) {
      return error(404, 'Not Found', 'Course not found');
    }
    
    // Check if user is the course owner
    if (course.educator.id !== educatorId && role !== 'admin') {
      return error(403, 'Forbidden', 'Only course owner can create assessments');
    }
    
    // Create assessment
    const assessment = await createAssessment({
      id: `assessment:${uuidv4()}`,
      course_id: courseId,
      title: assessmentData.title,
      description: assessmentData.description,
      time_limit_minutes: assessmentData.time_limit_minutes || 30,
      passing_score: assessmentData.passing_score || 70,
      due_date: assessmentData.due_date,
      questions: assessmentData.questions.map((q, index) => ({
        ...q,
        id: `question:${uuidv4()}`,
        order_index: index + 1
      }))
    });
    
    return success(201, {
      message: 'Assessment created successfully',
      assessment
    });
  } catch (err) {
    console.error('Error creating assessment:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Get assessments for a course
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
        return error(403, 'Forbidden', 'You must be enrolled in this course to view assessments');
      }
    }
    
    // Get all assessments for the course
    const assessments = await getAssessmentsByCourse(courseId);
    
    // For students, remove correct answers and add completion status
    if (role === 'student') {
      const studentAssessments = await Promise.all(assessments.map(async (assessment) => {
        // Get student results for this assessment
        const results = await getAssessmentResultsByStudent(userId, assessment.id);
        
        // Determine status
        let status = 'not_started';
        let score = null;
        
        if (results.length > 0) {
          status = 'completed';
          score = results[0].score;
        }
        
        // Remove correct answers from questions
        const sanitizedQuestions = assessment.questions.map(q => {
          const { correct_answer, ...rest } = q;
          return rest;
        });
        
        return {
          id: assessment.id,
          course_id: assessment.course_id,
          title: assessment.title,
          description: assessment.description,
          time_limit_minutes: assessment.time_limit_minutes,
          passing_score: assessment.passing_score,
          due_date: assessment.due_date,
          created_at: assessment.created_at,
          updated_at: assessment.updated_at,
          status,
          score,
          // Only include total number of questions, not the questions themselves
          question_count: assessment.questions.length
        };
      }));
      
      return success(200, { assessments: studentAssessments });
    }
    
    return success(200, { assessments });
  } catch (err) {
    console.error('Error getting assessments:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Get assessment for a student to take
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const take = async (event) => {
  try {
    const { id: assessmentId } = event.pathParameters || {};
    const { id: studentId, role } = event.user || {};
    
    // Validate user authentication
    if (!studentId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Validate student role
    if (role !== 'student') {
      return error(403, 'Forbidden', 'Only students can take assessments');
    }
    
    // Get the assessment
    const assessment = await getAssessmentById(assessmentId);
    if (!assessment) {
      return error(404, 'Not Found', 'Assessment not found');
    }
    
    // Check if enrolled in course
    const enrollment = await getEnrollment(assessment.course_id, studentId);
    if (!enrollment) {
      return error(403, 'Forbidden', 'You must be enrolled in this course to take assessments');
    }
    
    // Check if past due date
    const now = new Date();
    const dueDate = new Date(assessment.due_date);
    
    if (now > dueDate) {
      return error(400, 'Bad Request', 'Assessment due date has passed');
    }
    
    // Check if already taken
    const results = await getAssessmentResultsByStudent(studentId, assessmentId);
    if (results.length > 0) {
      return error(400, 'Bad Request', 'You have already completed this assessment');
    }
    
    // Remove correct answers from questions for student view
    const sanitizedQuestions = assessment.questions.map(q => {
      const { correct_answer, ...rest } = q;
      return rest;
    });
    
    // Calculate end time based on time limit
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + assessment.time_limit_minutes * 60000);
    
    const studentAssessment = {
      ...assessment,
      questions: sanitizedQuestions,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    };
    
    return success(200, { assessment: studentAssessment });
  } catch (err) {
    console.error('Error taking assessment:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

/**
 * Submit assessment answers
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} API Gateway Lambda proxy response
 */
const submit = async (event) => {
  try {
    const { id: assessmentId } = event.pathParameters || {};
    const { id: studentId, role } = event.user || {};
    const { answers } = JSON.parse(event.body);
    
    // Validate user authentication
    if (!studentId) {
      return error(401, 'Unauthorized', 'Authentication required');
    }
    
    // Validate student role
    if (role !== 'student') {
      return error(403, 'Forbidden', 'Only students can submit assessments');
    }
    
    // Get the assessment
    const assessment = await getAssessmentById(assessmentId);
    if (!assessment) {
      return error(404, 'Not Found', 'Assessment not found');
    }
    
    // Check if enrolled in course
    const enrollment = await getEnrollment(assessment.course_id, studentId);
    if (!enrollment) {
      return error(403, 'Forbidden', 'You must be enrolled in this course to submit assessments');
    }
    
    // Check if already submitted
    const existingResults = await getAssessmentResultsByStudent(studentId, assessmentId);
    if (existingResults.length > 0) {
      return error(400, 'Bad Request', 'You have already submitted this assessment');
    }
    
    // Calculate score
    let totalScore = 0;
    let totalPoints = 0;
    
    const gradedAnswers = answers.map(answer => {
      const question = assessment.questions.find(q => q.id === answer.question_id);
      
      if (!question) {
        return {
          ...answer,
          correct: false,
          points_earned: 0
        };
      }
      
      totalPoints += question.points;
      
      // For multiple choice and true/false questions
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const isCorrect = answer.answer === question.correct_answer;
        const pointsEarned = isCorrect ? question.points : 0;
        totalScore += pointsEarned;
        
        return {
          ...answer,
          correct: isCorrect,
          points_earned: pointsEarned
        };
      }
      
      // For essay questions, give full points initially (educator will grade later)
      if (question.type === 'essay') {
        const pointsEarned = question.points;
        totalScore += pointsEarned;
        
        return {
          ...answer,
          points_earned: pointsEarned,
          feedback: 'Essay response will be reviewed by the educator'
        };
      }
      
      return answer;
    });
    
    // Calculate percentage score
    const percentageScore = Math.round((totalScore / totalPoints) * 100);
    const passed = percentageScore >= assessment.passing_score;
    
    // Calculate time taken
    const submittedAt = new Date();
    const startTime = new Date(assessment.start_time || submittedAt); // Fallback if start_time not available
    const timeTakenMinutes = Math.round((submittedAt - startTime) / 60000);
    
    // Create assessment result
    const result = await submitAssessmentResult({
      id: `result:${uuidv4()}`,
      assessment_id: assessmentId,
      student_id: studentId,
      score: percentageScore,
      passed,
      time_taken_minutes: timeTakenMinutes,
      answers: gradedAnswers
    });
    
    return success(200, {
      message: 'Assessment submitted successfully',
      result
    });
  } catch (err) {
    console.error('Error submitting assessment:', err);
    return error(500, 'Internal Server Error', err.message);
  }
};

module.exports = {
  create,
  getByCourse,
  take,
  submit
}; 