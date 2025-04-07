use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use crate::models::user::User;

/// Quiz model for the platform
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quiz {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub title: String,
    pub description: String,
    pub section: Thing,
    pub order_index: i32,
    pub passing_score: i32,
    pub time_limit_minutes: i32,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub updated_at: Option<DateTime<Utc>>,
}

/// Quiz question types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum QuestionType {
    #[serde(rename = "multiple_choice")]
    MultipleChoice,
    #[serde(rename = "coding")]
    Coding,
    #[serde(rename = "true_false")]
    TrueFalse,
}

/// Question model for quizzes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizQuestion {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub quiz: Thing,
    pub question: String,
    pub question_type: QuestionType,
    pub options: Vec<String>,
    pub correct_answer: String,
    pub points: i32,
    pub order_index: i32,
}

/// Quiz attempt status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizAttempt {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub student: Thing,
    pub quiz: Thing,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub started_at: Option<DateTime<Utc>>,
    #[serde(with = "chrono::serde::ts_seconds_option", default)]
    pub submitted_at: Option<DateTime<Utc>>,
    pub score: i32,
    pub passed: bool,
    pub answers: Vec<QuizAnswer>,
}

/// Student's answer to a quiz question
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizAnswer {
    pub question_id: String,
    pub answer: String,
}

/// Response model for quiz data
#[derive(Debug, Serialize, Deserialize)]
pub struct QuizResponse {
    pub id: String,
    pub title: String,
    pub description: String,
    pub section_id: String,
    pub order_index: i32,
    pub passing_score: i32,
    pub time_limit_minutes: i32,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    pub created_at: Option<DateTime<Utc>>,
    pub questions: Vec<QuizQuestionResponse>,
}

/// Response model for quiz questions
#[derive(Debug, Serialize, Deserialize)]
pub struct QuizQuestionResponse {
    pub id: String,
    pub question: String,
    pub question_type: QuestionType,
    pub options: Vec<String>,
    pub points: i32,
    pub order_index: i32,
}

/// Request model to create a new quiz
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateQuizRequest {
    pub title: String,
    pub description: String,
    pub section_id: String,
    pub order_index: i32,
    pub passing_score: i32,
    pub time_limit_minutes: i32,
} 