/**
 * Main handler for AWS Lambda with API Gateway integration
 */

// Import handlers by category
const authHandlers = require('./handlers/auth');
const courseHandlers = require('./handlers/courses');
const codeExecutionHandlers = require('./handlers/code-execution');

// Import new handlers for enrollment, assignments, and assessments
const enrollmentHandlers = require('./handlers/courses/enrollment');
const assignmentHandlers = require('./handlers/courses/assignments');
const assessmentHandlers = require('./handlers/courses/assessments');
const fileHandlers = require('./handlers/files');

const { error } = require('./utils/response');

/**
 * Main Lambda handler function
 * Routes requests to the appropriate handler based on HTTP method and path
 * 
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract HTTP method and path
    const httpMethod = event.httpMethod;
    const path = event.path;
    
    console.log(`Processing ${httpMethod} request to ${path}`);

    // Handle OPTIONS requests for CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Max-Age': '3600'
        },
        body: ''
      };
    }

    // Add JWT validation middleware helper
    const addAuth = async (event) => {
      const { validateToken } = require('./middleware/auth');
      return await validateToken(event);
    };
    
    // Route the request based on method and path
    
    // Auth routes
    if (path === '/auth/login' && httpMethod === 'POST') {
      return await authHandlers.login.handler(event);
    } 
    
    if (path === '/auth/register' && httpMethod === 'POST') {
      return await authHandlers.register.handler(event);
    }
    
    if (path === '/auth/validate' && httpMethod === 'GET') {
      return await authHandlers.validate.handler(event);
    }
    
    if (path === '/auth/profile' && httpMethod === 'PUT') {
      const authenticatedEvent = await addAuth(event);
      return await authHandlers.updateProfile.handler(authenticatedEvent);
    }
    
    if ((path === '/auth/user' || path.startsWith('/auth/user/')) && httpMethod === 'GET') {
      const authenticatedEvent = await addAuth(event);
      return await authHandlers.getUser.handler(authenticatedEvent);
    }
    
    // Course routes
    if (path === '/courses' && httpMethod === 'GET') {
      return await courseHandlers.list.handler(event);
    } 

    if (path === '/courses/featured' && httpMethod === 'GET') {
      return await courseHandlers.featured.handler(event);
    }
    
    if (path === '/courses/enrolled' && httpMethod === 'GET') {
      const authenticatedEvent = await addAuth(event);
      return await enrollmentHandlers.getEnrolledCourses(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/[^\/]+\/enroll$/) && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await enrollmentHandlers.enroll(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/[^\/]+\/unenroll$/) && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await enrollmentHandlers.unenroll(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/[^\/]+\/progress$/) && httpMethod === 'PUT') {
      const authenticatedEvent = await addAuth(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await enrollmentHandlers.updateProgress(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/[^\/]+\/assignments$/) && httpMethod === 'GET') {
      const authenticatedEvent = await addAuth(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await assignmentHandlers.getByCourse(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/[^\/]+\/assignments$/) && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await assignmentHandlers.create(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/assignments\/[^\/]+$/) && httpMethod === 'GET') {
      const authenticatedEvent = await addAuth(event);
      const assignmentId = path.split('/')[3];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, assignment_id: assignmentId };
      return await assignmentHandlers.getById(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/assignments\/[^\/]+\/submit$/) && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      const assignmentId = path.split('/')[3];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, assignment_id: assignmentId };
      return await assignmentHandlers.submit(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/assignments\/[^\/]+\/submissions\/[^\/]+\/grade$/) && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      const parts = path.split('/');
      const assignmentId = parts[3];
      const submissionId = parts[5];
      authenticatedEvent.pathParameters = { 
        ...authenticatedEvent.pathParameters, 
        assignment_id: assignmentId,
        submission_id: submissionId
      };
      return await assignmentHandlers.grade(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/[^\/]+\/assessments$/) && httpMethod === 'GET') {
      const authenticatedEvent = await addAuth(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await assessmentHandlers.getByCourse(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/[^\/]+\/assessments$/) && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await assessmentHandlers.create(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/assessments\/[^\/]+\/take$/) && httpMethod === 'GET') {
      const authenticatedEvent = await addAuth(event);
      const assessmentId = path.split('/')[3];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: assessmentId };
      return await assessmentHandlers.take(authenticatedEvent);
    }
    
    if (path.match(/^\/courses\/assessments\/[^\/]+\/submit$/) && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      const assessmentId = path.split('/')[3];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: assessmentId };
      return await assessmentHandlers.submit(authenticatedEvent);
    }
    
    // File upload routes
    if (path === '/files/presigned-url' && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      return await fileHandlers.getPresignedUrl(authenticatedEvent);
    }

    if (path === '/files/confirm-upload' && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      return await fileHandlers.confirmFileUpload(authenticatedEvent);
    }

    if (path === '/files' && httpMethod === 'GET') {
      const authenticatedEvent = await addAuth(event);
      return await fileHandlers.getFiles(authenticatedEvent);
    }

    if (path.match(/^\/files\/[^\/]+$/) && httpMethod === 'DELETE') {
      const authenticatedEvent = await addAuth(event);
      const fileId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: fileId };
      return await fileHandlers.deleteFileHandler(authenticatedEvent);
    }
    
    if (path.startsWith('/courses/') && path.includes('/content') && httpMethod === 'GET') {
      const courseId = path.split('/')[2];
      event.pathParameters = { ...event.pathParameters, id: courseId };
      return await courseHandlers.content.getContent(event);
    }
    
    if (path.startsWith('/courses/') && path.includes('/content') && httpMethod === 'POST') {
      const authenticatedEvent = await addAuth(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await courseHandlers.content.addContent(authenticatedEvent);
    }
    
    if (path.includes('/content/') && httpMethod === 'PUT') {
      const authenticatedEvent = await addAuth(event);
      const contentId = path.split('/content/')[1];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, content_id: contentId };
      return await courseHandlers.content.updateContent(authenticatedEvent);
    }
    
    if (path.includes('/content/') && httpMethod === 'DELETE') {
      const authenticatedEvent = await addAuth(event);
      const contentId = path.split('/content/')[1];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, content_id: contentId };
      return await courseHandlers.content.deleteContent(authenticatedEvent);
    }
    
    if (path.startsWith('/courses/') && httpMethod === 'GET' && !path.includes('/content')) {
      return await courseHandlers.get.handler(event);
    } 
    
    if (path === '/courses' && httpMethod === 'POST') {
      return await courseHandlers.create.handler(event);
    } 
    
    if (path.startsWith('/courses/') && httpMethod === 'PUT' && !path.includes('/content')) {
      return await courseHandlers.update.handler(event);
    } 
    
    if (path.startsWith('/courses/') && httpMethod === 'DELETE' && !path.includes('/content')) {
      return await courseHandlers.delete.handler(event);
    }
    
    // Code execution routes
    if (path === '/code/execute' && httpMethod === 'POST') {
      return await codeExecutionHandlers.execute.handler(event);
    } 
    
    if (path === '/code/evaluate' && httpMethod === 'POST') {
      return await codeExecutionHandlers.evaluate.handler(event);
    }
    
    // Default 404 response for unmatched routes
    return error(404, 'Not Found', `No handler found for route: ${httpMethod} ${path}`);
  } catch (err) {
    console.error('Error processing request:', err);
    
    // Return proper error response
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
}; 