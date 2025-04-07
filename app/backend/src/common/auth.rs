use crate::common::error::AppError;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

// JWT claims structure
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,      // Subject (user ID)
    pub role: String,     // User role: "admin", "educator", "student", "moderator"
    pub exp: u64,         // Expiration time
    pub iat: u64,         // Issued at
}

/// Generate a JWT token for a user
pub fn generate_token(user_id: &str, role: &str) -> Result<String, AppError> {
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "kaiju_academy_secret_key".to_string());
    
    // Current timestamp
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| AppError::Internal(format!("System time error: {}", e)))?
        .as_secs();
    
    // Token expiry (24 hours)
    let expiry = now + Duration::from_secs(24 * 60 * 60).as_secs();
    
    // Create the claims
    let claims = Claims {
        sub: user_id.to_string(),
        role: role.to_string(),
        exp: expiry,
        iat: now,
    };
    
    // Create the token
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("Token generation error: {}", e)))?;
    
    Ok(token)
}

/// Validate a JWT token and return the claims
pub fn validate_token(token: &str) -> Result<Claims, AppError> {
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "kaiju_academy_secret_key".to_string());
    
    // Decode and validate the token
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|e| match e.kind() {
        jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
            AppError::Authentication("Token has expired".to_string())
        }
        jsonwebtoken::errors::ErrorKind::InvalidToken => {
            AppError::Authentication("Invalid token".to_string())
        }
        _ => AppError::Authentication(format!("Token validation error: {}", e)),
    })?;
    
    Ok(token_data.claims)
} 