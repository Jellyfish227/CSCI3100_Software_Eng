/**
 * Code execution handler
 */
const { success, error } = require('../../utils/response');

/**
 * Supported programming languages
 */
const SUPPORTED_LANGUAGES = ['python', 'javascript', 'rust', 'java', 'cpp'];

/**
 * Handle code execution request
 * @param {object} event - API Gateway Lambda proxy event
 * @returns {object} Lambda proxy response
 */
const handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.code) {
      return error(400, 'Validation Error', 'Code is required');
    }
    
    if (!body.language || !SUPPORTED_LANGUAGES.includes(body.language.toLowerCase())) {
      return error(400, 'Validation Error', `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`);
    }
    
    // In a real application, we would:
    // 1. Validate user authentication/authorization
    // 2. Execute the code in a sandboxed environment
    // Here, we're just mocking a successful execution
    
    // Simulate execution time
    const executionTimeMs = Math.floor(Math.random() * 100) + 50;
    
    // Generate mock execution result based on language
    let result;
    
    switch (body.language.toLowerCase()) {
      case 'python':
        result = mockPythonExecution(body.code, body.input);
        break;
      case 'javascript':
        result = mockJavaScriptExecution(body.code, body.input);
        break;
      default:
        result = {
          stdout: "Hello, World!\n",
          stderr: "",
          status: "SUCCESS"
        };
    }
    
    // Return success response
    return success(200, {
      result: {
        ...result,
        execution_time_ms: executionTimeMs,
        memory_usage_kb: Math.floor(Math.random() * 1000) + 500
      }
    });
  } catch (err) {
    console.error('Error in code execution handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

/**
 * Mock Python code execution
 * @param {string} code - Python code to execute
 * @param {string} input - Input to provide to the code
 * @returns {object} Execution result
 */
function mockPythonExecution(code, input) {
  if (code.includes('syntax error')) {
    return {
      stdout: "",
      stderr: "SyntaxError: invalid syntax",
      status: "COMPILE_ERROR"
    };
  }
  
  if (code.includes('while True') && !code.includes('break')) {
    return {
      stdout: "",
      stderr: "Execution timed out",
      status: "TIMEOUT"
    };
  }
  
  if (code.includes('print(')) {
    let output = "";
    
    if (input && input.includes('42')) {
      output = "42\n";
    } else if (code.includes('hello') || code.includes('Hello')) {
      output = "Hello, World!\n";
    } else {
      output = "Execution complete\n";
    }
    
    return {
      stdout: output,
      stderr: "",
      status: "SUCCESS"
    };
  }
  
  return {
    stdout: "",
    stderr: "",
    status: "SUCCESS"
  };
}

/**
 * Mock JavaScript code execution
 * @param {string} code - JavaScript code to execute
 * @param {string} input - Input to provide to the code
 * @returns {object} Execution result
 */
function mockJavaScriptExecution(code, input) {
  if (code.includes('syntax error')) {
    return {
      stdout: "",
      stderr: "SyntaxError: Unexpected token",
      status: "COMPILE_ERROR"
    };
  }
  
  if (code.includes('while(true)') && !code.includes('break')) {
    return {
      stdout: "",
      stderr: "Execution timed out",
      status: "TIMEOUT"
    };
  }
  
  if (code.includes('console.log')) {
    let output = "";
    
    if (input && input.includes('42')) {
      output = "42\n";
    } else if (code.includes('hello') || code.includes('Hello')) {
      output = "Hello, World!\n";
    } else {
      output = "Execution complete\n";
    }
    
    return {
      stdout: output,
      stderr: "",
      status: "SUCCESS"
    };
  }
  
  return {
    stdout: "",
    stderr: "",
    status: "SUCCESS"
  };
}

module.exports = { handler }; 