/**
 * Main handler for AWS Lambda with API Gateway integration
 */

// Import handlers by category
const authHandlers = require('./handlers/auth');
const courseHandlers = require('./handlers/courses');
const codeExecutionHandlers = require('./handlers/code-execution');
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
      // Add JWT validation middleware
      const { validateToken } = require('./middleware/auth');
      const authenticatedEvent = await validateToken(event);
      return await authHandlers.updateProfile.handler(authenticatedEvent);
    }
    
    if ((path === '/auth/user' || path.startsWith('/auth/user/')) && httpMethod === 'GET') {
      // Add JWT validation middleware
      const { validateToken } = require('./middleware/auth');
      const authenticatedEvent = await validateToken(event);
      return await authHandlers.getUser.handler(authenticatedEvent);
    }
    
    // Course routes
    if (path === '/courses' && httpMethod === 'GET') {
      return await courseHandlers.list.handler(event);
    } 

    if (path === '/courses/featured' && httpMethod === 'GET') {
      return await courseHandlers.featured.handler(event);
    }
    
    if (path.startsWith('/courses/') && path.includes('/content') && httpMethod === 'GET') {
      const courseId = path.split('/')[2];
      event.pathParameters = { ...event.pathParameters, id: courseId };
      return await courseHandlers.content.getContent(event);
    }
    
    if (path.startsWith('/courses/') && path.includes('/content') && httpMethod === 'POST') {
      // Add JWT validation middleware
      const { validateToken } = require('./middleware/auth');
      const authenticatedEvent = await validateToken(event);
      const courseId = path.split('/')[2];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, id: courseId };
      return await courseHandlers.content.addContent(authenticatedEvent);
    }
    
    if (path.includes('/content/') && httpMethod === 'PUT') {
      // Add JWT validation middleware
      const { validateToken } = require('./middleware/auth');
      const authenticatedEvent = await validateToken(event);
      const contentId = path.split('/content/')[1];
      authenticatedEvent.pathParameters = { ...authenticatedEvent.pathParameters, content_id: contentId };
      return await courseHandlers.content.updateContent(authenticatedEvent);
    }
    
    if (path.includes('/content/') && httpMethod === 'DELETE') {
      // Add JWT validation middleware
      const { validateToken } = require('./middleware/auth');
      const authenticatedEvent = await validateToken(event);
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