use anyhow::Result;
use std::sync::Arc;
use surrealdb::{engine::remote::ws::Client, Surreal};
use tracing::{info, error};

/// Get a SurrealDB client instance
pub async fn get_db_client() -> Result<Arc<Surreal<Client>>> {
    // Get connection details from environment variables
    let db_host = std::env::var("SURREALDB_HOST").unwrap_or_else(|_| "localhost".to_string());
    let db_port = std::env::var("SURREALDB_PORT").unwrap_or_else(|_| "8000".to_string());
    let db_user = std::env::var("SURREALDB_USER").unwrap_or_else(|_| "root".to_string());
    let db_pass = std::env::var("SURREALDB_PASS").unwrap_or_else(|_| "root".to_string());
    let db_namespace = std::env::var("SURREALDB_NS").unwrap_or_else(|_| "code_learning_platform".to_string());
    let db_database = std::env::var("SURREALDB_DB").unwrap_or_else(|_| "code_learning_platform".to_string());
    
    let connection_string = format!("ws://{}:{}", db_host, db_port);
    
    info!("Connecting to SurrealDB at {}", connection_string);
    
    // Create a connection to the SurrealDB server
    let db = Surreal::new::<surrealdb::engine::remote::ws::Ws>(&connection_string).await?;
    
    // Sign in as a namespace, database, or root user
    db.signin(surrealdb::opt::auth::Root {
        username: &db_user,
        password: &db_pass,
    }).await?;
    
    // Select a specific namespace / database
    db.use_ns(&db_namespace).use_db(&db_database).await?;
    
    info!("Successfully connected to SurrealDB namespace {} and database {}", db_namespace, db_database);
    
    Ok(Arc::new(db))
}

/// Initialize the database connection
pub async fn init_db() -> Result<Arc<Surreal<Client>>> {
    match get_db_client().await {
        Ok(client) => {
            info!("Database connection initialized successfully");
            Ok(client)
        }
        Err(err) => {
            error!("Failed to initialize database connection: {}", err);
            Err(err)
        }
    }
} 