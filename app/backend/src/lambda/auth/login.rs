use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use http::HeaderMap;
use lambda_runtime::{Error, LambdaEvent};
use serde_json::json;
use std::collections::HashMap;
use tracing::{error, info};

use argon2::password_hash::PasswordVerifier;
use crate::common::auth;
use crate::common::db;
use crate::common::error::AppError;
use crate::models::user::{User, UserLoginRequest, UserResponse};

/// Lambda handler for user login
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Parse request body
    let login_request = match request.body {
        Some(body) => match serde_json::from_str::<UserLoginRequest>(&body) {
            Ok(req) => req,
            Err(err) => {
                error!("Failed to parse login request: {}", err);
                return Ok(AppError::Validation(format!("Invalid request format: {}", err)).into());
            }
        },
        None => {
            return Ok(AppError::Validation("Missing request body".to_string()).into());
        }
    };

    // Validate email and password
    if login_request.email.is_empty() || login_request.password.is_empty() {
        return Ok(AppError::Validation("Email and password are required".to_string()).into());
    }

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
    let result: Result<Option<User>, _> = db
        .query("SELECT * FROM user WHERE email = $email LIMIT 1")
        .bind(("email", login_request.email.clone()))
        .await
        .and_then(|mut res| res.take::<Option<User>>(0));

    let user = match result {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Ok(
                AppError::Authentication("Invalid email or password".to_string()).into(),
            );
        }
        Err(err) => {
            error!("Database error during login: {}", err);
            return Ok(AppError::Database(err).into());
        }
    };

    // Verify password
    let stored_password = match user.password {
        Some(ref pw) => pw,
        None => {
            return Ok(
                AppError::Authentication("Invalid email or password".to_string()).into(),
            );
        }
    };

    // Use the Argon2 crate to verify the password
    // In Argon2 0.5+, we need to use the password-hash crate's functions
    let is_valid = match argon2::Argon2::default().verify_password(
        login_request.password.as_bytes(),
        &argon2::password_hash::PasswordHash::new(stored_password).unwrap()
    ) {
        Ok(_) => true,
        Err(err) => {
            error!("Error verifying password: {}", err);
            return Ok(
                AppError::Authentication("Failed to verify password".to_string()).into(),
            );
        }
    };

    if !is_valid {
        return Ok(
            AppError::Authentication("Invalid email or password".to_string()).into(),
        );
    }

    // Generate JWT token
    let user_id = user.id.as_ref().map(|id| id.to_string()).unwrap_or_default();
    let token = match auth::generate_token(&user_id, &user.role.to_string()) {
        Ok(token) => token,
        Err(err) => {
            error!("Failed to generate token: {}", err);
            return Ok(err.into());
        }
    };

    // Update last login timestamp
    let _: Result<(), _> = db
        .query("UPDATE $user SET last_login = time::now()")
        .bind(("user", user.id.clone()))
        .await
        .map(|_| ());

    // Create successful response with token
    let response_body = json!({
        "message": "Login successful",
        "token": token,
        "user": UserResponse::from(user)
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