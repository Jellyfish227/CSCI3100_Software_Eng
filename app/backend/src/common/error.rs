use aws_lambda_events::event::apigw::ApiGatewayProxyResponse;
use http::HeaderMap;
use aws_lambda_events::encodings::Body;
use serde_json::json;
use thiserror::Error;

// Mapping error types for the application
#[derive(Error, Debug)]
pub enum AppError {
    #[error("Authentication error: {0}")]
    Authentication(String),
    
    #[error("Authorization error: {0}")]
    Authorization(String),
    
    #[error("Resource not found: {0}")]
    NotFound(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Database error: {0}")]
    Database(#[from] surrealdb::Error),
    
    #[error("Internal server error: {0}")]
    Internal(String),
    
    #[error("External service error: {0}")]
    ExternalService(String),
    
    #[error("Rate limit exceeded: {0}")]
    RateLimit(String),
}

// Convert an application error to an API Gateway response
impl From<AppError> for ApiGatewayProxyResponse {
    fn from(error: AppError) -> Self {
        let (status_code, error_type) = match &error {
            AppError::Authentication(_) => (401, "Authentication Error"),
            AppError::Authorization(_) => (403, "Authorization Error"),
            AppError::NotFound(_) => (404, "Not Found"),
            AppError::Validation(_) => (400, "Validation Error"),
            AppError::Database(_) => (500, "Database Error"),
            AppError::Internal(_) => (500, "Internal Server Error"),
            AppError::ExternalService(_) => (502, "External Service Error"),
            AppError::RateLimit(_) => (429, "Rate Limit Exceeded"),
        };
        
        let body = json!({
            "error": {
                "type": error_type,
                "message": error.to_string()
            }
        });
        
        let body_str = body.to_string();
        
        let mut headers = HeaderMap::new();
        headers.insert("Content-Type", "application/json".parse().unwrap());
        
        ApiGatewayProxyResponse {
            status_code,
            headers,
            multi_value_headers: HeaderMap::new(),
            body: Some(Body::from(body_str)),
            is_base64_encoded: false,
        }
    }
} 