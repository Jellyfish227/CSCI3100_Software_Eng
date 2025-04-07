use std::env;
use tracing::info;
use once_cell::sync::Lazy;

/// Application configuration
pub struct Config {
    // Database configuration
    pub db_host: String,
    pub db_port: String,
    pub db_user: String,
    pub db_pass: String,
    pub db_namespace: String,
    pub db_database: String,
    
    // JWT configuration
    pub jwt_secret: String,
    pub jwt_expiry_hours: u64,
    
    // AWS configuration
    pub aws_region: String,
    pub s3_bucket: String,
    pub s3_prefix: String,
    
    // Application configuration
    pub api_version: String,
    pub environment: String,
    pub code_execution_timeout_secs: u64,
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        let config = Config {
            // Database configuration
            db_host: env::var("SURREALDB_HOST").unwrap_or_else(|_| "localhost".to_string()),
            db_port: env::var("SURREALDB_PORT").unwrap_or_else(|_| "8000".to_string()),
            db_user: env::var("SURREALDB_USER").unwrap_or_else(|_| "root".to_string()),
            db_pass: env::var("SURREALDB_PASS").unwrap_or_else(|_| "root".to_string()),
            db_namespace: env::var("SURREALDB_NS").unwrap_or_else(|_| "code_learning_platform".to_string()),
            db_database: env::var("SURREALDB_DB").unwrap_or_else(|_| "code_learning_platform".to_string()),
            
            // JWT configuration
            jwt_secret: env::var("JWT_SECRET").unwrap_or_else(|_| "kaiju_academy_secret_key".to_string()),
            jwt_expiry_hours: env::var("JWT_EXPIRY_HOURS")
                .unwrap_or_else(|_| "24".to_string())
                .parse()
                .unwrap_or(24),
            
            // AWS configuration
            aws_region: env::var("AWS_REGION").unwrap_or_else(|_| "us-east-1".to_string()),
            s3_bucket: env::var("S3_BUCKET").unwrap_or_else(|_| "kaiju-academy-assets".to_string()),
            s3_prefix: env::var("S3_PREFIX").unwrap_or_else(|_| "dev/".to_string()),
            
            // Application configuration
            api_version: env::var("API_VERSION").unwrap_or_else(|_| "v1".to_string()),
            environment: env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            code_execution_timeout_secs: env::var("CODE_EXECUTION_TIMEOUT_SECS")
                .unwrap_or_else(|_| "5".to_string())
                .parse()
                .unwrap_or(5),
        };
        
        info!("Configuration loaded from environment");
        config
    }
    
    /// Is the application running in production mode?
    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }
    
    /// Get the full S3 path for a file
    pub fn s3_path(&self, file_path: &str) -> String {
        format!("{}{}", self.s3_prefix, file_path)
    }
}

/// Global configuration instance, lazily loaded
pub static CONFIG: Lazy<Config> = Lazy::new(Config::from_env); 