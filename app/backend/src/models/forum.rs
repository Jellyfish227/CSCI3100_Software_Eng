use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

/// Forum Category model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForumCategory {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub name: String,
    pub description: String,
    pub course: Thing,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub created_at: Option<DateTime<Utc>>,
    pub created_by: Thing,
}

/// Forum Thread model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForumThread {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub title: String,
    pub content: String,
    pub category: Thing,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub created_at: Option<DateTime<Utc>>,
    pub created_by: Thing,
    pub is_pinned: bool,
    pub is_locked: bool,
    pub views: i32,
}

/// Forum Post (reply) model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForumPost {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub thread: Thing,
    pub content: String,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub created_at: Option<DateTime<Utc>>,
    pub created_by: Thing,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub updated_at: Option<DateTime<Utc>>,
    pub is_solution: bool,
}

/// Request model to create a new forum category
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub description: String,
    pub course_id: String,
}

/// Request model to create a new forum thread
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateThreadRequest {
    pub title: String,
    pub content: String,
    pub category_id: String,
}

/// Request model to create a new forum post
#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePostRequest {
    pub content: String,
    pub thread_id: String,
}

/// Response model for forum categories
#[derive(Debug, Serialize, Deserialize)]
pub struct CategoryResponse {
    pub id: String,
    pub name: String,
    pub description: String,
    pub course_id: String, 
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub created_at: Option<DateTime<Utc>>,
    pub created_by: String,
}

/// Response model for forum threads
#[derive(Debug, Serialize, Deserialize)]
pub struct ThreadResponse {
    pub id: String,
    pub title: String,
    pub content: String,
    pub category_id: String,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub created_at: Option<DateTime<Utc>>,
    pub created_by: String,
    pub is_pinned: bool,
    pub is_locked: bool,
    pub views: i32,
    pub posts_count: i32,
}

/// Response model for forum posts
#[derive(Debug, Serialize, Deserialize)]
pub struct PostResponse {
    pub id: String,
    pub thread_id: String,
    pub content: String,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub created_at: Option<DateTime<Utc>>,
    pub created_by: String,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub updated_at: Option<DateTime<Utc>>,
    pub is_solution: bool,
} 