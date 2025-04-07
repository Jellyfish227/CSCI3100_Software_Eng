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
use crate::models::course::Course;

/// Query parameters for course listing
#[derive(Debug, Serialize, Deserialize, Default)]
struct CourseListParams {
    limit: Option<usize>,
    offset: Option<usize>,
    category: Option<String>,
    difficulty: Option<String>,
    query: Option<String>,
    include_unpublished: Option<bool>,
}

/// Lambda handler for listing courses
pub async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let request = event.payload;

    // Parse query parameters
    let mut params = CourseListParams::default();
    
    // Handle query parameters
    for (key, value) in request.query_string_parameters.iter() {
        match key {
            "limit" => params.limit = value.parse::<usize>().ok(),
            "offset" => params.offset = value.parse::<usize>().ok(),
            "category" => params.category = Some(value.to_string()),
            "difficulty" => params.difficulty = Some(value.to_string()),
            "query" => params.query = Some(value.to_string()),
            "include_unpublished" => params.include_unpublished = value.parse::<bool>().ok(),
            _ => {}
        }
    }

    // Set default values
    let limit = params.limit.unwrap_or(20).min(100); // Max 100 items per page
    let offset = params.offset.unwrap_or(0);

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

    // Build the query
    let mut query_builder = String::from("SELECT * FROM course");
    let mut conditions = Vec::new();
    let mut bindings = HashMap::new();
    
    // Add conditions based on params
    // Only show published courses unless include_unpublished is true and user is admin/educator
    let include_unpublished = params.include_unpublished.unwrap_or(false) && 
                              (claims.role == "admin" || claims.role == "educator");
    
    if !include_unpublished {
        conditions.push("is_published = true");
    }
    
    // Add category filter
    if let Some(category) = &params.category {
        conditions.push("category = $category");
        bindings.insert("category", category.to_string());
    }
    
    // Add difficulty filter
    if let Some(difficulty) = &params.difficulty {
        conditions.push("difficulty = $difficulty");
        bindings.insert("difficulty", difficulty.to_string());
    }
    
    // Add text search if query parameter is provided
    if let Some(query) = &params.query {
        conditions.push("(title CONTAINS $query OR description CONTAINS $query)");
        bindings.insert("query", query.to_string());
    }
    
    // Add WHERE clause if conditions exist
    if !conditions.is_empty() {
        query_builder.push_str(" WHERE ");
        query_builder.push_str(&conditions.join(" AND "));
    }
    
    // Add ORDER BY, LIMIT and OFFSET
    query_builder.push_str(" ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
    bindings.insert("limit", limit.to_string());
    bindings.insert("offset", offset.to_string());
    
    // Execute the query
    let mut db_query = db.query(&query_builder);
    
    // Apply all bindings
    for (key, value) in bindings.clone() {
        db_query = db_query.bind((key, value));
    }
    
    // Execute the query and parse the results
    let courses: Result<Vec<Course>, _> = db_query
        .await
        .and_then(|mut res| res.take::<Vec<Course>>(0));
    
    // Also get the total count
    let mut total_count_query = String::from("SELECT count() FROM course");
    
    // Add WHERE clause for count query if conditions exist
    if !conditions.is_empty() {
        let where_clause = format!(" WHERE {}", conditions.join(" AND "));
        total_count_query.push_str(&where_clause);
    }
        
    let mut db_count_query = db.query(&total_count_query);
    
    // Apply all bindings except limit and offset
    for (key, value) in bindings {
        if key != "limit" && key != "offset" {
            db_count_query = db_count_query.bind((key, value));
        }
    }
    
    // Execute the count query
    let total_count_result = db_count_query.await;
    let total_count = match total_count_result {
        Ok(mut res) => {
            match res.take::<Option<usize>>(0) {
                Ok(Some(count)) => count as i64,
                Ok(None) => 0,
                Err(err) => {
                    error!("Error parsing count: {}", err);
                    0
                }
            }
        },
        Err(err) => {
            error!("Error executing count query: {}", err);
            0
        }
    };
    
    // Handle database query results
    let courses = match courses {
        Ok(courses) => courses,
        Err(err) => {
            error!("Database error when listing courses: {}", err);
            return Ok(AppError::Database(err).into());
        }
    };

    // Create successful response
    let response_body = json!({
        "courses": courses,
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
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