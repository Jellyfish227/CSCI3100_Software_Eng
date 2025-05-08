use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use http::HeaderMap;
use lambda_runtime::{Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use tracing::{error, info};

use crate::common::db;
use crate::common::error::AppError;
use crate::models::user::User;

/// Email verification request model
#[derive(Debug, Serialize, Deserialize)]
struct VerificationRequest {
    email: String,
    verification_code: String,
}

/// Lambda handler for email verification
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Parse request body
    let verification_request = match request.body {
        Some(body) => match serde_json::from_str::<VerificationRequest>(&body) {
            Ok(req) => req,
            Err(err) => {
                error!("Failed to parse verification request: {}", err);
                return Ok(AppError::Validation(format!("Invalid request format: {}", err)).into());
            }
        },
        None => {
            return Ok(AppError::Validation("Missing request body".to_string()).into());
        }
    };

    // Validate request fields
    if verification_request.email.is_empty() || verification_request.verification_code.is_empty() {
        return Ok(AppError::Validation("Email and verification code are required".to_string()).into());
    }

    // In a real implementation, this would validate against AWS Cognito or a verification code stored in the database
    // For this example, we'll simulate the verification process
    
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

    // Find user by email
    let user_result: Result<Option<User>, _> = db
        .query("SELECT * FROM user WHERE email = $email LIMIT 1")
        .bind(("email", verification_request.email.clone()))
        .await
        .and_then(|mut res| res.take::<Option<User>>(0));

    let user = match user_result {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Ok(
                AppError::NotFound("User not found".to_string()).into(),
            );
        }
        Err(err) => {
            error!("Database error during verification: {}", err);
            return Ok(AppError::Database(err).into());
        }
    };

    // In a real implementation, we would verify the code against what was sent to the user
    // For this example, we'll accept any 6-digit code that starts with "123"
    if !verification_request.verification_code.starts_with("123") || verification_request.verification_code.len() != 6 {
        return Ok(
            AppError::Validation("Invalid verification code".to_string()).into(),
        );
    }

    // Update user's verification status in database
    // In a real implementation, we would have a verified field in the user model
    info!("Verifying email for user: {}", user.email);
    
    // Simulate updating the user's verification status
    let _: Result<(), _> = db
        .query("UPDATE user SET email_verified = true WHERE id = $id")
        .bind(("id", user.id))
        .await
        .map(|_| ());

    // Create successful response
    let response_body = json!({
        "message": "Email verified successfully",
        "email": verification_request.email
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