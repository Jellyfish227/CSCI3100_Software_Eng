use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

/// Course difficulty levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CourseDifficulty {
    #[serde(rename = "beginner")]
    Beginner,
    #[serde(rename = "intermediate")]
    Intermediate,
    #[serde(rename = "advanced")]
    Advanced,
}

impl ToString for CourseDifficulty {
    fn to_string(&self) -> String {
        match self {
            CourseDifficulty::Beginner => "beginner".to_string(),
            CourseDifficulty::Intermediate => "intermediate".to_string(),
            CourseDifficulty::Advanced => "advanced".to_string(),
        }
    }
}

/// Course model for database operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Course {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub title: String,
    pub description: String,
    pub difficulty: CourseDifficulty,
    pub tags: Vec<String>,
    pub educator: Thing,  // Reference to a user record with educator role
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub updated_at: Option<DateTime<Utc>>,
    pub is_published: bool,
    pub thumbnail: String,
    pub duration_hours: f32,
}

impl Course {
    /// Create a new course
    pub fn new(
        title: String,
        description: String,
        difficulty: CourseDifficulty,
        tags: Vec<String>,
        educator: Thing,
        thumbnail: String,
        duration_hours: f32,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: None,
            title,
            description,
            difficulty,
            tags,
            educator,
            created_at: Some(now),
            updated_at: Some(now),
            is_published: false,
            thumbnail,
            duration_hours,
        }
    }
}

/// Section model for database operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Section {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub title: String,
    pub description: String,
    pub order_index: i32,
    pub course: Thing,  // Reference to a course record
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub updated_at: Option<DateTime<Utc>>,
}

/// Material types that can be associated with a section
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MaterialType {
    #[serde(rename = "pdf")]
    PDF,
    #[serde(rename = "video")]
    Video,
    #[serde(rename = "code")]
    Code,
}

impl ToString for MaterialType {
    fn to_string(&self) -> String {
        match self {
            MaterialType::PDF => "pdf".to_string(),
            MaterialType::Video => "video".to_string(),
            MaterialType::Code => "code".to_string(),
        }
    }
}

/// Material model for database operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub title: String,
    pub description: String,
    pub material_type: MaterialType,
    pub content_url: String,
    pub duration_minutes: i32,
    pub section: Thing,  // Reference to a section record
    pub order_index: i32,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub updated_at: Option<DateTime<Utc>>,
}

impl Material {
    pub fn new(title: String, description: String, material_type: MaterialType, content_url: String, duration_minutes: i32, section: Thing, order_index: i32) -> Self {
        Self {
            id: None,
            title,
            description,
            material_type,
            content_url,
            duration_minutes,
            section,
            order_index,
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        }
    }
}

/// Enrollment model for database operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Enrollment {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub student: Thing,  // Reference to a user record with student role
    pub course: Thing,   // Reference to a course record
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub enrolled_at: Option<DateTime<Utc>>,
    pub completed: bool,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub completed_at: Option<DateTime<Utc>>,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub last_accessed_at: Option<DateTime<Utc>>,
}

impl Enrollment {
    pub fn new(student: Thing, course: Thing) -> Self {
        Self {
            id: None,
            student,
            course,
            enrolled_at: Some(Utc::now()),
            completed: false,
            completed_at: None,
            last_accessed_at: None,
        }
    }
}

/// Progress model for tracking student progress through materials
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Progress {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub student: Thing,   // Reference to a user record with student role
    pub material: Thing,  // Reference to a material record
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub started_at: Option<DateTime<Utc>>,
    pub completed: bool,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub completed_at: Option<DateTime<Utc>>,
    pub progress_percentage: f32,
}

/// Course update request for updating course details
#[derive(Debug, Serialize, Deserialize)]
pub struct CourseUpdateRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub difficulty: Option<CourseDifficulty>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub is_published: Option<bool>,
    pub thumbnail_url: Option<String>,
    pub modules: Option<Vec<String>>,
}

/// Course creation request
#[derive(Debug, Serialize, Deserialize)]
pub struct CourseCreateRequest {
    pub title: String,
    pub description: String,
    pub difficulty: CourseDifficulty,
    pub category: String,
    pub is_published: Option<bool>,
    pub thumbnail_url: String,
    pub modules: Vec<String>,
    pub tags: Vec<String>,
} 