use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use http::HeaderMap;
use lambda_runtime::{Error, LambdaEvent};
use serde_json::json;
use std::collections::HashMap;
use tracing::{error, info};

use crate::common::auth;
use crate::common::db;
use crate::common::error::AppError;
use crate::models::user::{User, UserRegistrationRequest, UserResponse};

/// Lambda handler for user registration
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Parse request body
    let registration_request = match request.body {
        Some(body) => match serde_json::from_str::<UserRegistrationRequest>(&body) {
            Ok(req) => req,
            Err(err) => {
                error!("Failed to parse registration request: {}", err);
                return Ok(AppError::Validation(format!("Invalid request format: {}", err)).into());
            }
        },
        None => {
            return Ok(AppError::Validation("Missing request body".to_string()).into());
        }
    };

    // Validate request fields
    if registration_request.email.is_empty() || registration_request.password.is_empty() || registration_request.name.is_empty() {
        return Ok(AppError::Validation("Email, password, and name are required".to_string()).into());
    }

    // Validate email format (simple check)
    if !registration_request.email.contains('@') {
        return Ok(AppError::Validation("Invalid email format".to_string()).into());
    }

    // Validate password complexity
    if registration_request.password.len() < 8 {
        return Ok(AppError::Validation("Password must be at least 8 characters".to_string()).into());
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

    // Check if user with this email already exists
    let existing_user: Result<Option<User>, _> = db
        .query("SELECT * FROM user WHERE email = $email LIMIT 1")
        .bind(("email", registration_request.email.clone()))
        .await
        .and_then(|mut res| res.take::<Option<User>>(0));

    match existing_user {
        Ok(Some(_)) => {
            return Ok(
                AppError::Validation("User with this email already exists".to_string()).into(),
            );
        }
        Ok(None) => {
            // Proceed with registration
        }
        Err(err) => {
            error!("Database error during registration: {}", err);
            return Ok(AppError::Database(err).into());
        }
    }

    // Create password hash
    use argon2::{
        password_hash::{
            rand_core::OsRng,
            PasswordHasher, SaltString
        },
        Argon2
    };
    
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = match Argon2::default().hash_password(
        registration_request.password.as_bytes(),
        &salt
    ) {
        Ok(hash) => hash.to_string(),
        Err(err) => {
            error!("Failed to hash password: {}", err);
            return Ok(
                AppError::Internal("Failed to process credentials".to_string()).into(),
            );
        }
    };

    // Create new user
    let new_user = User {
        id: None, // Database will assign ID
        email: registration_request.email,
        password: Some(password_hash),
        name: registration_request.name,
        role: registration_request.role,
        created_at: Some(chrono::Utc::now()),
        last_login: None,
        profile_image: None,
        bio: None,
    };

    // Insert user into database
    let created_user: Result<Option<User>, _> = db
        .query("CREATE user CONTENT $data RETURN *")
        .bind(("data", new_user.clone()))
        .await
        .and_then(|mut res| res.take::<Option<User>>(0));

    let user = match created_user {
        Ok(Some(user)) => user,
        Ok(None) => {
            error!("User created but not returned");
            return Ok(AppError::Internal("Failed to retrieve created user".to_string()).into());
        }
        Err(err) => {
            error!("Failed to create user: {}", err);
            return Ok(AppError::Database(err).into());
        }
    };

    // Create Cognito user (simulated here, actual implementation would call AWS Cognito)
    info!("Creating Cognito user for {}", user.email);
    // TODO: Implement actual Cognito user creation

    // Generate JWT token for immediate login
    let user_id = user.id.as_ref().map(|id| id.to_string()).unwrap_or_default();
    let token = match auth::generate_token(&user_id, &user.role.to_string()) {
        Ok(token) => token,
        Err(err) => {
            error!("Failed to generate token: {}", err);
            return Ok(err.into());
        }
    };

    // Create successful response
    let response_body = json!({
        "message": "Registration successful",
        "token": token,
        "user": UserResponse::from(user)
    });

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());

    Ok(ApiGatewayProxyResponse {
        status_code: 201, // Created
        headers,
        multi_value_headers: HeaderMap::new(),
        body: Some(Body::from(response_body.to_string())),
        is_base64_encoded: false,
    })
} 