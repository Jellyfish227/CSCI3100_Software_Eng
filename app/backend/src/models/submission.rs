use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

/// Submission status enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SubmissionStatus {
    #[serde(rename = "submitted")]
    Submitted,
    #[serde(rename = "reviewed")]
    Reviewed,
    #[serde(rename = "passed")]
    Passed,
    #[serde(rename = "failed")]
    Failed,
}

/// Code submission model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeSubmission {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub student: Thing,
    pub material: Thing,
    pub code: String,
    pub language: String,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub submitted_at: Option<DateTime<Utc>>,
    pub status: SubmissionStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub feedback: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reviewed_by: Option<Thing>,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub reviewed_at: Option<DateTime<Utc>>,
}

/// Request model to create a new code submission
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSubmissionRequest {
    pub material_id: String,
    pub code: String,
    pub language: String,
}

/// Request model to update a submission with review
#[derive(Debug, Serialize, Deserialize)]
pub struct ReviewSubmissionRequest {
    pub status: SubmissionStatus,
    pub feedback: String,
}

/// Response model for code submissions
#[derive(Debug, Serialize, Deserialize)]
pub struct SubmissionResponse {
    pub id: String,
    pub student_id: String,
    pub material_id: String,
    pub code: String,
    pub language: String,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub submitted_at: Option<DateTime<Utc>>,
    pub status: SubmissionStatus,
    pub feedback: Option<String>,
    pub reviewed_by_id: Option<String>,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub reviewed_at: Option<DateTime<Utc>>,
}

impl From<CodeSubmission> for SubmissionResponse {
    fn from(submission: CodeSubmission) -> Self {
        Self {
            id: submission.id.map(|id| id.to_string()).unwrap_or_default(),
            student_id: submission.student.to_string(),
            material_id: submission.material.to_string(),
            code: submission.code,
            language: submission.language,
            submitted_at: submission.submitted_at,
            status: submission.status,
            feedback: submission.feedback,
            reviewed_by_id: submission.reviewed_by.map(|id| id.to_string()),
            reviewed_at: submission.reviewed_at,
        }
    }
} 