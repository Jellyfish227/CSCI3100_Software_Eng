use lambda_runtime::{service_fn, Error, LambdaEvent};
use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use serde_json::json;
use tracing::{info, instrument};
use std::collections::HashMap;
use http::HeaderMap;

// Module imports
mod common;
mod models;
mod lambda;

/// This is the main handler for AWS Lambda. It will be called when the Lambda function is invoked.
/// It routes the request to the appropriate handler based on the HTTP method and path.
#[instrument(skip(event))]
async fn function_handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    // Initialize tracing
    common::logger::init_tracing();
    
    // Extract the request
    let request = &event.payload;
    
    // Log the request
    info!(
        "Received API Gateway request: {} {}",
        request.http_method.to_string(),
        request.path.as_deref().unwrap_or_default()
    );
    
    // Route the request based on path and method
    match (request.http_method.to_string().as_str(), request.path.as_deref()) {
        // Authentication routes
        ("POST", Some("/auth/login")) => lambda::auth::login::handler(event).await,
        ("POST", Some("/auth/register")) => lambda::auth::register::handler(event).await,
        ("POST", Some("/auth/verify")) => lambda::auth::verify::handler(event).await,
        
        // Course routes
        ("POST", Some("/courses")) => lambda::course::create::handler(event).await,
        ("GET", Some("/courses")) => lambda::course::list::handler(event).await,
        ("GET", Some(path)) if path.starts_with("/courses/") => lambda::course::get::handler(event).await,
        ("PUT", Some(path)) if path.starts_with("/courses/") => lambda::course::update::handler(event).await,
        ("DELETE", Some(path)) if path.starts_with("/courses/") => lambda::course::delete::handler(event).await,
        
        // Code execution routes
        ("POST", Some("/code/execute")) => lambda::code_execution::execute::handler(event).await,
        ("POST", Some("/code/evaluate")) => lambda::code_execution::evaluate::handler(event).await,
        
        // Default response for unmatched routes
        _ => {
            let path = request.path.as_deref().unwrap_or_default();
            let method = request.http_method.to_string();
            
            info!("No handler found for route: {} {}", method, path);
            
            let mut headers = HeaderMap::new();
            headers.insert("Content-Type", "application/json".parse().unwrap());
            
            let body = json!({
                "error": {
                    "type": "Not Found",
                    "message": format!("No handler found for route: {} {}", method, path)
                }
            });
            
            Ok(ApiGatewayProxyResponse {
                status_code: 404,
                headers,
                multi_value_headers: HeaderMap::new(),
                body: Some(Body::from(body.to_string())),
                is_base64_encoded: false,
            })
        }
    }
}

/// Lambda runtime entry point
#[tokio::main]
async fn main() -> Result<(), Error> {
    // Initialize tracing
    common::logger::init_tracing();
    
    // Start the Lambda runtime and pass it our function handler
    lambda_runtime::run(service_fn(function_handler)).await?;
    
    Ok(())
}
