use tracing::{Level, Subscriber};
use tracing_subscriber::FmtSubscriber;

/// Initialize tracing with the appropriate log level based on the environment
pub fn init_tracing() {
    // Determine log level based on environment
    let log_level = match std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".into()).to_lowercase().as_str() {
        "trace" => Level::TRACE,
        "debug" => Level::DEBUG,
        "info" => Level::INFO,
        "warn" => Level::WARN,
        "error" => Level::ERROR,
        _ => Level::INFO,
    };
    
    // Create a subscriber with the determined log level
    let subscriber = FmtSubscriber::builder()
        .with_max_level(log_level)
        .finish();
    
    // Set the subscriber as the default
    if let Err(err) = tracing::subscriber::set_global_default(subscriber) {
        eprintln!("Failed to set tracing subscriber: {}", err);
    }
} 