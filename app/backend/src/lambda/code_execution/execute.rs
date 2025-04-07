use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use http::HeaderMap;
use lambda_runtime::{Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tracing::{error, info};

use crate::common::auth;
use crate::common::error::AppError;

/// Programming languages supported for code execution
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    Python,
    Rust,
    JavaScript,
    Java,
    Cpp,
}

/// Code execution request
#[derive(Debug, Serialize, Deserialize)]
pub struct ExecuteCodeRequest {
    pub code: String,
    pub language: Language,
    pub input: Option<String>,
    pub timeout_seconds: Option<u64>,
}

/// Code execution result
#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub stdout: String,
    pub stderr: String,
    pub execution_time_ms: u64,
    pub status: ExecutionStatus,
    pub memory_usage_kb: Option<u64>,
}

/// Execution status codes
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ExecutionStatus {
    Success,
    CompileError,
    RuntimeError,
    Timeout,
    MemoryLimitExceeded,
}

/// Lambda handler for code execution
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Parse request body
    let execute_request = match request.body {
        Some(body) => match serde_json::from_str::<ExecuteCodeRequest>(&body) {
            Ok(req) => req,
            Err(err) => {
                error!("Failed to parse code execution request: {}", err);
                return Ok(AppError::Validation(format!("Invalid request format: {}", err)).into());
            }
        },
        None => {
            return Ok(AppError::Validation("Missing request body".to_string()).into());
        }
    };

    // Validate request fields
    if execute_request.code.is_empty() {
        return Ok(AppError::Validation("Code cannot be empty".to_string()).into());
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

    // Set execution timeout (default: 5 seconds, max: 30 seconds)
    let timeout = Duration::from_secs(execute_request.timeout_seconds.unwrap_or(5).min(30));

    // Log the execution request
    info!(
        "Executing {} code for user {}, code length: {} chars",
        format!("{:?}", execute_request.language).to_lowercase(),
        claims.sub,
        execute_request.code.len()
    );

    // Execute the code (in a real environment, this would call AWS Fargate or ECS to run the code)
    // For now, simulate execution with a simulated result
    let start_time = Instant::now();
    
    // Simulate a delay
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Create a simulated execution result
    let result = match execute_request.language {
        Language::Python => simulate_python_execution(&execute_request.code, execute_request.input.as_deref()),
        Language::Rust => simulate_rust_execution(&execute_request.code, execute_request.input.as_deref()),
        Language::JavaScript => simulate_javascript_execution(&execute_request.code, execute_request.input.as_deref()),
        Language::Java => simulate_java_execution(&execute_request.code, execute_request.input.as_deref()),
        Language::Cpp => simulate_cpp_execution(&execute_request.code, execute_request.input.as_deref()),
    };
    
    // Create response
    let elapsed = start_time.elapsed().as_millis() as u64;
    
    let execution_result = ExecutionResult {
        stdout: result.0,
        stderr: result.1,
        execution_time_ms: elapsed,
        status: result.2,
        memory_usage_kb: Some(1024), // Simulated memory usage
    };

    // Create successful response
    let response_body = json!({
        "result": execution_result
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

// Simulate Python code execution
fn simulate_python_execution(code: &str, input: Option<&str>) -> (String, String, ExecutionStatus) {
    if code.contains("syntax error") {
        return (
            String::new(),
            "SyntaxError: invalid syntax".to_string(),
            ExecutionStatus::CompileError,
        );
    }
    
    if code.contains("while True:") {
        return (
            String::new(),
            "Error: Execution timed out".to_string(),
            ExecutionStatus::Timeout,
        );
    }
    
    if code.contains("print") {
        return (
            "Hello, World!\n".to_string(),
            String::new(),
            ExecutionStatus::Success,
        );
    }
    
    (
        "".to_string(),
        "".to_string(),
        ExecutionStatus::Success,
    )
}

// Simulate Rust code execution
fn simulate_rust_execution(code: &str, input: Option<&str>) -> (String, String, ExecutionStatus) {
    if code.contains("compile_error") {
        return (
            String::new(),
            "error[E0425]: cannot find value `undefined_variable` in this scope".to_string(),
            ExecutionStatus::CompileError,
        );
    }
    
    if code.contains("loop {") && !code.contains("break") {
        return (
            String::new(),
            "Error: Execution timed out".to_string(),
            ExecutionStatus::Timeout,
        );
    }
    
    if code.contains("println!") {
        return (
            "Hello, World!\n".to_string(),
            String::new(),
            ExecutionStatus::Success,
        );
    }
    
    (
        "".to_string(),
        "".to_string(),
        ExecutionStatus::Success,
    )
}

// Simulate JavaScript code execution
fn simulate_javascript_execution(code: &str, input: Option<&str>) -> (String, String, ExecutionStatus) {
    if code.contains("syntax error") {
        return (
            String::new(),
            "SyntaxError: Unexpected token".to_string(),
            ExecutionStatus::CompileError,
        );
    }
    
    if code.contains("while(true)") {
        return (
            String::new(),
            "Error: Execution timed out".to_string(),
            ExecutionStatus::Timeout,
        );
    }
    
    if code.contains("console.log") {
        return (
            "Hello, World!\n".to_string(),
            String::new(),
            ExecutionStatus::Success,
        );
    }
    
    (
        "".to_string(),
        "".to_string(),
        ExecutionStatus::Success,
    )
}

// Simulate Java code execution
fn simulate_java_execution(code: &str, input: Option<&str>) -> (String, String, ExecutionStatus) {
    if code.contains("syntax error") {
        return (
            String::new(),
            "Main.java:5: error: ';' expected".to_string(),
            ExecutionStatus::CompileError,
        );
    }
    
    if code.contains("while(true)") {
        return (
            String::new(),
            "Error: Execution timed out".to_string(),
            ExecutionStatus::Timeout,
        );
    }
    
    if code.contains("System.out.println") {
        return (
            "Hello, World!\n".to_string(),
            String::new(),
            ExecutionStatus::Success,
        );
    }
    
    (
        "".to_string(),
        "".to_string(),
        ExecutionStatus::Success,
    )
}

// Simulate C++ code execution
fn simulate_cpp_execution(code: &str, input: Option<&str>) -> (String, String, ExecutionStatus) {
    if code.contains("syntax error") {
        return (
            String::new(),
            "main.cpp:5:10: error: expected ';' after expression".to_string(),
            ExecutionStatus::CompileError,
        );
    }
    
    if code.contains("while(true)") {
        return (
            String::new(),
            "Error: Execution timed out".to_string(),
            ExecutionStatus::Timeout,
        );
    }
    
    if code.contains("std::cout") {
        return (
            "Hello, World!\n".to_string(),
            String::new(),
            ExecutionStatus::Success,
        );
    }
    
    (
        "".to_string(),
        "".to_string(),
        ExecutionStatus::Success,
    )
} 