use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use http::HeaderMap;
use lambda_runtime::{Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use tracing::{error, info};

use crate::common::auth;
use crate::common::db;
use crate::common::error::AppError;
use crate::lambda::code_execution::execute::{Language, ExecutionStatus};

/// Test case definition
#[derive(Debug, Serialize, Deserialize)]
pub struct TestCase {
    pub id: String,
    pub input: String,
    pub expected_output: String,
    pub description: Option<String>,
    pub is_hidden: bool,
    pub points: Option<f64>,
}

/// Submission evaluation request
#[derive(Debug, Serialize, Deserialize)]
pub struct EvaluationRequest {
    pub code: String,
    pub language: Language,
    pub assignment_id: String,
    pub test_cases: Option<Vec<TestCase>>,
}

/// Test case result
#[derive(Debug, Serialize, Deserialize)]
pub struct TestCaseResult {
    pub test_case_id: String,
    pub passed: bool,
    pub actual_output: String,
    pub expected_output: String,
    pub description: Option<String>,
    pub is_hidden: bool,
    pub error: Option<String>,
    pub points_awarded: f64,
    pub points_possible: f64,
}

/// Overall evaluation result
#[derive(Debug, Serialize, Deserialize)]
pub struct EvaluationResult {
    pub submission_id: String,
    pub execution_status: ExecutionStatus,
    pub test_results: Vec<TestCaseResult>,
    pub total_points: f64,
    pub maximum_points: f64,
    pub percentage: f64,
    pub feedback: String,
}

/// Lambda handler for evaluating code submissions
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Parse request body
    let evaluation_request = match request.body {
        Some(body) => match serde_json::from_str::<EvaluationRequest>(&body) {
            Ok(req) => req,
            Err(err) => {
                error!("Failed to parse evaluation request: {}", err);
                return Ok(AppError::Validation(format!("Invalid request format: {}", err)).into());
            }
        },
        None => {
            return Ok(AppError::Validation("Missing request body".to_string()).into());
        }
    };

    // Validate request fields
    if evaluation_request.code.is_empty() {
        return Ok(AppError::Validation("Code cannot be empty".to_string()).into());
    }

    if evaluation_request.assignment_id.is_empty() {
        return Ok(AppError::Validation("Assignment ID is required".to_string()).into());
    }

    // Extract and validate authorization token
    let token = match request.headers.get("Authorization") {
        Some(auth_header) => {
            let auth_str = match auth_header.to_str() {
                Ok(s) => s,
                Err(_) => {
                    return Ok(AppError::Authentication("Invalid authorization header".to_string()).into());
                }
            };
            let parts: Vec<&str> = auth_str.split_whitespace().collect();
            if parts.len() != 2 || parts[0].to_lowercase() != "bearer" {
                return Ok(AppError::Authentication("Invalid authorization format".to_string()).into());
            }
            parts[1]
        }
        None => {
            return Ok(AppError::Authentication("Missing authorization header".to_string()).into());
        }
    };

    // Validate token and extract claims
    let claims = match auth::validate_token(token) {
        Ok(claims) => claims,
        Err(err) => {
            return Ok(err.into());
        }
    };

    // Connect to database
    let db = match db::get_db_client().await {
        Ok(client) => client,
        Err(err) => {
            error!("Failed to connect to database: {}", err);
            return Ok(
                AppError::Internal("Failed to connect to the database".to_string()).into(),
            );
        }
    };

    // Fetch test cases if not provided in the request
    let test_cases = if let Some(test_cases) = evaluation_request.test_cases {
        test_cases
    } else {
        // Fetch test cases from database
        let assignment_id = evaluation_request.assignment_id.clone();
        let test_cases_result: Result<Vec<TestCase>, _> = db
            .query("SELECT * FROM test_case WHERE assignment_id = $assignment_id")
            .bind(("assignment_id", assignment_id))
            .await
            .and_then(|mut res| res.take::<Vec<TestCase>>(0));

        match test_cases_result {
            Ok(test_cases) => {
                if test_cases.is_empty() {
                    return Ok(AppError::NotFound("No test cases found for this assignment".to_string()).into());
                }
                test_cases
            }
            Err(err) => {
                error!("Database error when fetching test cases: {}", err);
                return Ok(AppError::Database(err).into());
            }
        }
    };

    // Log the evaluation request
    info!(
        "Evaluating {} code submission for assignment {} from user {}, {} test cases",
        format!("{:?}", evaluation_request.language).to_lowercase(),
        evaluation_request.assignment_id,
        claims.sub,
        test_cases.len()
    );

    // In a real implementation, we would execute the code against each test case
    // For this example, we'll simulate the evaluation process
    let mut test_results = Vec::new();
    let mut total_points = 0.0;
    let mut maximum_points = 0.0;
    
    for test_case in &test_cases {
        let points_possible = test_case.points.unwrap_or(1.0);
        let (passed, actual_output, error) = simulate_test_case_execution(
            &evaluation_request.code,
            &evaluation_request.language,
            &test_case.input,
            &test_case.expected_output,
        );
        
        let points_awarded = if passed { points_possible } else { 0.0 };
        total_points += points_awarded;
        maximum_points += points_possible;
        
        test_results.push(TestCaseResult {
            test_case_id: test_case.id.clone(),
            passed,
            actual_output,
            expected_output: if test_case.is_hidden { "".to_string() } else { test_case.expected_output.clone() },
            description: test_case.description.clone(),
            is_hidden: test_case.is_hidden,
            error,
            points_awarded,
            points_possible,
        });
    }
    
    let percentage = if maximum_points > 0.0 {
        (total_points / maximum_points) * 100.0
    } else {
        0.0
    };
    
    // Generate feedback based on results
    let feedback = generate_feedback(&test_results, percentage);
    
    // Create a unique submission ID
    let submission_id = format!("sub_{}", uuid::Uuid::new_v4());
    
    // In a real implementation, we would store the submission in the database
    // For this example, we'll just return the evaluation result
    
    let evaluation_result = EvaluationResult {
        submission_id,
        execution_status: ExecutionStatus::Success, // Assume success for simulation
        test_results,
        total_points,
        maximum_points,
        percentage,
        feedback,
    };

    // Create successful response
    let response_body = json!({
        "result": evaluation_result
    });

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());

    Ok(ApiGatewayProxyResponse {
        status_code: 200,
        headers,
        multi_value_headers: HeaderMap::new(),
        body: Some(Body::from(response_body.to_string())),
        is_base64_encoded: false,
    })
}

// Simulate test case execution
fn simulate_test_case_execution(
    code: &str,
    language: &Language,
    input: &str,
    expected_output: &str,
) -> (bool, String, Option<String>) {
    // For simulation, we'll provide some canned responses based on the code content
    
    match language {
        Language::Python => {
            if code.contains("syntax error") {
                return (false, String::new(), Some("SyntaxError: invalid syntax".to_string()));
            }
            
            if code.contains("runtime error") {
                return (false, String::new(), Some("RuntimeError: error occurred during execution".to_string()));
            }
            
            // Simple logic to match certain inputs to expected outputs
            if input.contains("42") && code.contains("print(") {
                let actual_output = "42\n".to_string();
                return (actual_output.trim() == expected_output.trim(), actual_output, None);
            }
            
            if input.contains("hello") && code.contains("print(") {
                let actual_output = "Hello, World!\n".to_string();
                return (actual_output.trim() == expected_output.trim(), actual_output, None);
            }
            
            // Default case
            return (expected_output == "Pass", "Pass".to_string(), None);
        },
        Language::Rust | Language::JavaScript | Language::Java | Language::Cpp => {
            // Similar logic for other languages
            if code.contains("error") {
                return (false, String::new(), Some("Error in code execution".to_string()));
            }
            
            // Default case - alternate pass/fail based on input content
            let pass = input.len() % 2 == 0;
            return (pass, if pass { expected_output.to_string() } else { "Incorrect output".to_string() }, None);
        }
    }
}

// Generate feedback based on test results
fn generate_feedback(test_results: &[TestCaseResult], percentage: f64) -> String {
    let passed_count = test_results.iter().filter(|r| r.passed).count();
    let total_count = test_results.len();
    
    if passed_count == total_count {
        "Excellent! All tests passed.".to_string()
    } else if percentage >= 80.0 {
        format!("Good job! You passed {}/{} tests.", passed_count, total_count)
    } else if percentage >= 50.0 {
        format!("You're on the right track, but there are still some issues. You passed {}/{} tests.", passed_count, total_count)
    } else {
        "Your solution needs more work. Review the test cases and try again.".to_string()
    }
} 