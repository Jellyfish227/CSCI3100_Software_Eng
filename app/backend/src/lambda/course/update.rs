use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use lambda_runtime::{Error, LambdaEvent};
use serde_json::json;
use tracing::{error, info};
use http::HeaderMap;

use crate::common::auth;
use crate::common::db;
use crate::common::error::AppError;
use crate::models::course::{Course, CourseUpdateRequest};

/// Lambda handler for updating course details
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Extract course ID from path parameters
    let course_id = match request.path_parameters.get("id") {
        Some(id) => id.to_string(),
        None => {
            return Ok(AppError::Validation("Course ID is required".to_string()).into());
        }
    };

    // Parse request body
    let update_request = match request.body {
        Some(body) => match serde_json::from_str::<CourseUpdateRequest>(&body) {
            Ok(req) => req,
            Err(err) => {
                error!("Failed to parse course update request: {}", err);
                return Ok(AppError::Validation(format!("Invalid request format: {}", err)).into());
            }
        },
        None => {
            return Ok(AppError::Validation("Missing request body".to_string()).into());
        }
    };

    // Validate request fields
    if let Some(title) = &update_request.title {
        if title.is_empty() {
            return Ok(AppError::Validation("Title cannot be empty".to_string()).into());
        }
    }

    if let Some(description) = &update_request.description {
        if description.is_empty() {
            return Ok(AppError::Validation("Description cannot be empty".to_string()).into());
        }
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

    // Fetch the existing course
    let course_result: Result<Option<Course>, _> = db
        .query("SELECT * FROM course WHERE id = $id")
        .bind(("id", course_id.clone()))
        .await
        .and_then(|mut res| res.take::<Option<Course>>(0));

    let course = match course_result {
        Ok(Some(course)) => course,
        Ok(None) => {
            return Ok(
                AppError::NotFound(format!("Course with ID {} not found", course_id)).into(),
            );
        }
        Err(err) => {
            error!("Database error when fetching course: {}", err);
            return Ok(AppError::Database(err).into());
        }
    };

    // Check update permissions
    // Only the creator, educators, or admins can update a course
    let user_id = &claims.sub;
    let user_role = &claims.role;
    
    if course.educator.to_string() != *user_id && user_role != "admin" && user_role != "educator" {
        return Ok(AppError::Authorization("You do not have permission to update this course".to_string()).into());
    }

    // Build the update query
    let mut set_clauses = Vec::new();
    let mut bindings = std::collections::HashMap::new();
    
    // Add fields to update
    if let Some(title) = update_request.title {
        set_clauses.push("title = $title");
        bindings.insert("title", title);
    }
    
    if let Some(description) = update_request.description {
        set_clauses.push("description = $description");
        bindings.insert("description", description);
    }
    
    if let Some(category) = update_request.category {
        set_clauses.push("category = $category");
        bindings.insert("category", category);
    }
    
    if let Some(difficulty) = update_request.difficulty {
        set_clauses.push("difficulty = $difficulty");
        bindings.insert("difficulty", difficulty.to_string());
    }
    
    if let Some(is_published) = update_request.is_published {
        set_clauses.push("is_published = $is_published");
        bindings.insert("is_published", is_published.to_string());
    }
    
    if let Some(thumbnail_url) = update_request.thumbnail_url {
        set_clauses.push("thumbnail_url = $thumbnail_url");
        bindings.insert("thumbnail_url", thumbnail_url);
    }
    
    if let Some(modules) = update_request.modules {
        set_clauses.push("modules = $modules");
        bindings.insert("modules", serde_json::to_string(&modules).unwrap_or_default());
    }
    
    if let Some(tags) = update_request.tags {
        set_clauses.push("tags = $tags");
        bindings.insert("tags", serde_json::to_string(&tags).unwrap_or_default());
    }
    
    // Always update updated_at and updated_by
    set_clauses.push("updated_at = time::now()");
    set_clauses.push("updated_by = $updated_by");
    bindings.insert("updated_by", claims.sub.clone());
    
    // If no fields to update, return the unchanged course
    if set_clauses.is_empty() {
        let response_body = json!({
            "message": "No changes detected",
            "course": course
        });

        let mut headers = HeaderMap::new();
        headers.insert("Content-Type", "application/json".parse().unwrap());

        return Ok(ApiGatewayProxyResponse {
            status_code: 200,
            headers,
            multi_value_headers: HeaderMap::new(),
            body: Some(Body::from(response_body.to_string())),
            is_base64_encoded: false,
        });
    }
    
    // Build the update query
    let query = format!("UPDATE course SET {} WHERE id = $id RETURN AFTER", set_clauses.join(", "));
    
    // Execute the update
    let mut db_query = db.query(&query).bind(("id", course_id.clone()));
    
    // Add all bindings
    for (key, value) in bindings {
        db_query = db_query.bind((key, value));
    }
    
    // Execute the query and get updated course
    let updated_course: Result<Option<Course>, _> = db_query
        .await
        .and_then(|mut res| res.take::<Option<Course>>(0));
    
    let course = match updated_course {
        Ok(Some(course)) => course,
        Ok(None) => {
            return Ok(
                AppError::NotFound(format!("Course with ID {} no longer exists", course_id)).into(),
            );
        }
        Err(err) => {
            error!("Database error when updating course: {}", err);
            return Ok(AppError::Database(err).into());
        }
    };

    // Create successful response
    let response_body = json!({
        "message": "Course updated successfully",
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