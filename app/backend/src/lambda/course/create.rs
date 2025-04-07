use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use lambda_runtime::{Error, LambdaEvent};
use serde_json::json;
use tracing::{error, info};
use http::HeaderMap;
use surrealdb::sql::Thing;

use crate::common::auth;
use crate::common::db;
use crate::common::error::AppError;
use crate::models::course::{Course, CourseCreateRequest};
use crate::models::user::UserRole;

/// Lambda handler for course creation
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Parse request body
    let course_request = match request.body {
        Some(body) => match serde_json::from_str::<CourseCreateRequest>(&body) {
            Ok(req) => req,
            Err(err) => {
                error!("Failed to parse course creation request: {}", err);
                return Ok(AppError::Validation(format!("Invalid request format: {}", err)).into());
            }
        },
        None => {
            return Ok(AppError::Validation("Missing request body".to_string()).into());
        }
    };

    // Validate request fields
    if course_request.title.is_empty() || course_request.description.is_empty() {
        return Ok(AppError::Validation("Title and description are required".to_string()).into());
    }

    // Extract and validate authorization token
    let token = match request.headers.get("Authorization") {
        Some(auth_header) => {
            let auth_str = auth_header.to_str().unwrap_or_default();
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

    // Check if user has educator or admin role
    if claims.role != "educator" && claims.role != "admin" {
        return Ok(AppError::Authorization("Only educators and admins can create courses".to_string()).into());
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
    
    // Create user reference
    let educator = Thing::from(("user", &*claims.sub));

    // Create course object
    let new_course = Course {
        id: None,
        title: course_request.title,
        description: course_request.description,
        difficulty: course_request.difficulty,
        tags: course_request.tags,
        educator,
        created_at: Some(chrono::Utc::now()),
        updated_at: Some(chrono::Utc::now()),
        is_published: course_request.is_published.unwrap_or(false),
        thumbnail: course_request.thumbnail_url,
        duration_hours: 0.0, // Default duration, will be updated as content is added
    };

    // Insert course into database
    let created_course: Result<Option<Course>, _> = db
        .query("CREATE course CONTENT $data RETURN *")
        .bind(("data", new_course))
        .await
        .and_then(|mut res| res.take::<Option<Course>>(0));

    let course = match created_course {
        Ok(Some(course)) => course,
        Ok(None) => {
            return Ok(AppError::Internal("Course created but not returned".to_string()).into());
        }
        Err(err) => {
            error!("Failed to create course: {}", err);
            return Ok(AppError::Database(err).into());
        }
    };

    // Create successful response
    let response_body = json!({
        "message": "Course created successfully",
        "course": course
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