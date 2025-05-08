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
use crate::models::course::Course;

/// Lambda handler for retrieving course details
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Extract course ID from path parameters
    let course_id = match request.path_parameters.get("id") {
        Some(id) => id.to_string(),
        None => {
            return Ok(AppError::Validation("Course ID is required".to_string()).into());
        }
    };

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

    // Query course by ID
    let course_result: Result<Option<Course>, _> = db
        .query("SELECT * FROM course WHERE id = $id")
        .bind(("id", course_id.clone()))
        .await
        .and_then(|mut res| res.take::<Option<Course>>(0));

    // Handle database query result
    let course = match course_result {
        Ok(Some(course)) => course,
        Ok(None) => {
            return Ok(
                AppError::NotFound(format!("Course with ID {} not found", course_id)).into(),
            );
        }
        Err(err) => {
            error!("Database error when retrieving course: {}", err);
            return Ok(AppError::Database(err).into());
        }
    };

    // Check access permissions
    // If course is not published, only the creator, educators, or admins can access it
    if !course.is_published {
        let user_id = &claims.sub;
        let user_role = &claims.role;
        
        if course.educator.to_string() != *user_id && user_role != "educator" && user_role != "admin" {
            return Ok(AppError::Authorization("You do not have permission to access this unpublished course".to_string()).into());
        }
    }

    // Create successful response
    let response_body = json!({
        "course": course
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