use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

/// User roles in the system
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum UserRole {
    #[serde(rename = "admin")]
    Admin,
    #[serde(rename = "educator")]
    Educator,
    #[serde(rename = "student")]
    Student,
    #[serde(rename = "moderator")]
    Moderator,
}

impl ToString for UserRole {
    fn to_string(&self) -> String {
        match self {
            UserRole::Admin => "admin".to_string(),
            UserRole::Educator => "educator".to_string(),
            UserRole::Student => "student".to_string(),
            UserRole::Moderator => "moderator".to_string(),
        }
    }
}

/// User model for database operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    pub name: String,
    pub role: UserRole,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub last_login: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub profile_image: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bio: Option<String>,
}

impl User {
    /// Create a new user
    pub fn new(email: String, name: String, role: UserRole) -> Self {
        Self {
            id: None,
            email,
            password: None,
            name,
            role,
            created_at: Some(Utc::now()),
            last_login: None,
            profile_image: None,
            bio: None,
        }
    }
}

/// User authentication request
#[derive(Debug, Serialize, Deserialize)]
pub struct UserLoginRequest {
    pub email: String,
    pub password: String,
}

/// User registration request
#[derive(Debug, Serialize, Deserialize)]
pub struct UserRegistrationRequest {
    pub email: String,
    pub password: String,
    pub name: String,
    pub role: UserRole,
}

/// User response (excludes sensitive fields)
#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub last_login: Option<DateTime<Utc>>,
    pub profile_image: Option<String>,
    pub bio: Option<String>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id.map(|id| id.to_string()).unwrap_or_default(),
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at,
            last_login: user.last_login,
            profile_image: user.profile_image,
            bio: user.bio,
        }
    }
} 