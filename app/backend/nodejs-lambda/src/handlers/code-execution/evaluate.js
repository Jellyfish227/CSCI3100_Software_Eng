/**
 * Code evaluation handler
 */
const { success, error } = require('../../utils/response');

/**
 * Supported programming languages
 */
const SUPPORTED_LANGUAGES = ['python', 'javascript', 'rust', 'java', 'cpp'];

/**
 * Handle code evaluation request
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
    
    if (!body.test_cases || !Array.isArray(body.test_cases) || body.test_cases.length === 0) {
      return error(400, 'Validation Error', 'At least one test case is required');
    }
    
    // In a real application, we would:
    // 1. Validate user authentication/authorization
    // 2. Execute the code against test cases in a sandboxed environment
    // Here, we're just mocking evaluation results
    
    // Evaluate each test case
    const testResults = body.test_cases.map((testCase, index) => {
      return evaluateTestCase(body.code, body.language, testCase, index);
    });
    
    // Calculate overall passed status
    const passed = testResults.every(result => result.passed);
    
    // Generate appropriate feedback
    let feedback;
    if (passed) {
      feedback = "Great job! All tests passed.";
    } else {
      const failCount = testResults.filter(result => !result.passed).length;
      feedback = `${failCount} out of ${testResults.length} tests failed. Check the test results for details.`;
    }
    
    // Return success response
    return success(200, {
      evaluation: {
        passed,
        test_results: testResults,
        feedback
      }
    });
  } catch (err) {
    console.error('Error in code evaluation handler:', err);
    return error(500, 'Internal Server Error', err.message || 'An unexpected error occurred');
  }
};

/**
 * Evaluate a single test case
 * @param {string} code - Code to evaluate
 * @param {string} language - Programming language
 * @param {object} testCase - Test case to evaluate
 * @param {number} index - Test case index
 * @returns {object} Test result
 */
function evaluateTestCase(code, language, testCase, index) {
  // Extract test case data
  const { input, expected_output, name } = testCase;
  const testName = name || `Test ${index + 1}`;
  
  // For simulation, we'll provide canned responses based on the code and inputs
  if (code.includes('syntax error')) {
    return {
      name: testName,
      passed: false,
      output: null,
      error: "Syntax error in code"
    };
  }
  
  if (code.includes('infinite loop') || (code.includes('while') && !code.includes('break'))) {
    return {
      name: testName,
      passed: false,
      output: null,
      error: "Time limit exceeded"
    };
  }
  
  // Simulate code execution
  const output = simulateCodeOutput(code, language, input);
  
  // Check if output matches expected output
  const passed = output.trim() === expected_output.trim();
  
  return {
    name: testName,
    passed,
    output,
    error: passed ? null : "Output doesn't match expected result"
  };
}

/**
 * Simulate code execution output
 * @param {string} code - Code to execute
 * @param {string} language - Programming language
 * @param {string} input - Input to provide to the code
 * @returns {string} Simulated output
 */
function simulateCodeOutput(code, language, input) {
  // Simple pattern matching to determine output
  if (input.includes('42')) {
    return '42';
  }
  
  if (input.includes('hello') || code.includes('hello') || code.includes('Hello')) {
    return 'Hello, World!';
  }
  
  if (input.includes('sum') || code.includes('sum') || code.includes('add')) {
    return '15';
  }
  
  // Default output
  return 'Success';
}

module.exports = { handler }; 