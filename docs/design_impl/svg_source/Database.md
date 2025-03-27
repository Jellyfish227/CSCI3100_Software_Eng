# Database Design and Implementation

## Overview
This document outlines the database architecture for the Kaiju Academy e-learning platform, justifying our selection of SurrealDB as the primary database management system.

## Why SurrealDB?

After careful consideration of the requirements specified in our Software Requirements Specification (SRS), we have selected SurrealDB as our database solution. SurrealDB is a multi-model database system that combines the flexibility of NoSQL with the relational capabilities of traditional SQL databases.

### Key Reasons for Choosing SurrealDB

#### 1. ACID Compliance
As specified in our SRS under Additional Requirements: "The system should support relational databases with ACID compliance." SurrealDB provides full ACID (Atomicity, Consistency, Isolation, Durability) compliance, ensuring data integrity even in case of system failures.

#### 2. Scalability
Our SRS requires the platform to "support up to 10,000 concurrent users without degradation in performance" and handle "10,000 code submissions per minute." SurrealDB's distributed architecture allows horizontal scaling, making it suitable for handling high loads and concurrent operations required by our educational platform.

#### 3. Multi-Model Support
Kaiju Academy has diverse data requirements, including:
- Structured course data (relational)
- User profiles and progress tracking
- Nested course materials and modules
- Graph-like relationships (student-course-educator)

SurrealDB's multi-model nature allows us to work with relational, document, graph, and key-value data within the same database, eliminating the need for multiple database systems.

#### 4. Real-time Capabilities
The SRS specifies that "real-time collaboration features must have a latency of less than 200ms." SurrealDB's real-time capabilities and WebSocket support enable features like live discussion forums, real-time progress updates, and instant notifications.

#### 5. Query Language Flexibility
SurrealDB uses SurrealQL, which combines SQL-like syntax with support for complex relationships and document queries. This provides flexibility for various query needs:
- Complex course relationship navigation
- Progress tracking and analytics
- Content management queries
- Advanced search functionality

#### 6. Reduced Development Complexity
Using a single database system rather than multiple specialized databases simplifies our architecture, reducing:
- Development time
- Operational complexity
- Potential points of failure
- Maintenance burden

## Data Model Overview

Our core data model reflects the key entities in the Kaiju Academy platform:

```
User {
    id: ID,
    username: string,
    email: string,
    role: enum (Student, Educator, Admin, Moderator),
    profile: object,
    created_at: datetime
}

Course {
    id: ID,
    title: string,
    description: text,
    creator: -> User,
    modules: [-> Module],
    created_at: datetime,
    updated_at: datetime
}

Module {
    id: ID,
    title: string,
    content: array,
    course: -> Course,
    order: int,
    assessments: [-> Assessment]
}

Assessment {
    id: ID,
    title: string,
    module: -> Module,
    questions: array,
    time_limit: int,
    passing_score: int
}

Progress {
    id: ID,
    user: -> User,
    course: -> Course,
    modules_completed: array,
    assessments_completed: array,
    last_activity: datetime
}

Discussion {
    id: ID,
    title: string,
    content: text,
    author: -> User,
    course: -> Course,
    replies: [-> Reply],
    created_at: datetime
}
```

## Performance Considerations

To meet our SRS performance requirements:
- Response time: < 2 seconds for 95% of users
- Code execution results: < 5 seconds for 99% of submissions
- Support for 10,000 concurrent users

We will implement:
1. Strategic indexing on frequently queried fields
2. Read replicas for distributing query load
3. Caching for frequently accessed data
4. Query optimization for complex operations
5. Database sharding for horizontal scaling

## Backup and Recovery

To fulfill the SRS requirement that "Regular backups of user data must be performed daily and stored securely for at least 30 days," we will:
- Implement automated daily backups of the SurrealDB database
- Store backups in geographically distributed secure storage
- Test restoration procedures regularly
- Maintain point-in-time recovery capabilities

## Security Implementation

SurrealDB provides robust security features that help us meet the security requirements specified in the SRS:
- Authentication using multiple methods
- Row-level and field-level permissions
- Encryption of sensitive data
- Support for TLS for data in transit

## Detailed Database Schema

Below is a detailed description of our SurrealDB implementation as defined in our initialization script (`dbinit.surql`). The schema design directly supports the functional requirements outlined in the SRS.

### Database Configuration

```sql
DEFINE DATABASE code_learning_platform;
USE NS code_learning_platform;
USE DB code_learning_platform;
```

### Core Tables

#### User Management

**User Table**
- Stores user information with role-based differentiation
- Fields include: email, password, name, role, created_at, last_login, profile_image, bio
- Email field is validated to ensure proper format
- Roles are constrained to: admin, educator, student, moderator
- Unique index on email to prevent duplicates

#### Course Management

**Course Table**
- Stores information about educational courses
- Fields include: title, description, difficulty, tags, educator, created_at, updated_at, is_published, thumbnail, duration_hours
- Difficulty is constrained to: beginner, intermediate, advanced
- References educator from user table with role validation
- Index on title for efficient search

**Section Table**
- Organizes courses into logical sections
- Fields include: title, description, order_index, course, created_at, updated_at
- Composite index on course and order_index for efficient ordering

**Material Table**
- Stores learning materials (content) within sections
- Fields include: title, description, type, content_url, duration_minutes, section, order_index, created_at, updated_at
- Type is constrained to: pdf, video, code
- Composite index on section and order_index for ordered retrieval

#### Assessment System

**Quiz Table**
- Defines quizzes associated with course sections
- Fields include: title, description, section, order_index, passing_score, time_limit_minutes, created_at, updated_at
- Default passing score of 60% and time limit of 30 minutes
- Indexed by section and order_index

**Quiz_Question Table**
- Stores individual questions within quizzes
- Fields include: quiz, question, type, options, correct_answer, points, order_index
- Question types are constrained to: multiple_choice, coding, true_false
- Indexed by quiz and order_index for ordered presentation

#### Student Progress Tracking

**Enrollment Table**
- Tracks student enrollment in courses
- Fields include: student, course, enrolled_at, completed, completed_at, last_accessed_at
- Role validation ensures only students can be enrolled
- Unique composite index on student and course to prevent duplicate enrollments

**Progress Table**
- Tracks detailed student progress through materials
- Fields include: student, material, started_at, completed, completed_at, progress_percentage
- Default progress starts at 0%
- Unique composite index on student and material

**Code_Submission Table**
- Stores code submitted by students for exercises
- Fields include: student, material, code, language, submitted_at, status, feedback, reviewed_by, reviewed_at
- Status constrained to: submitted, reviewed, passed, failed
- Indexed by student and material for efficient retrieval

**Quiz_Attempt Table**
- Records student attempts at quizzes
- Fields include: student, quiz, started_at, submitted_at, score, passed, answers
- Default score of 0
- Indexed by student and quiz

#### Community Features

**Forum_Category Table**
- Organizes forum discussions by category
- Fields include: name, description, course, created_at, created_by
- Indexed by name for efficient search

**Forum_Thread Table**
- Stores discussion threads within categories
- Fields include: title, content, category, created_at, created_by, is_pinned, is_locked, views
- Indexed by category for efficient filtering

**Forum_Post Table**
- Stores individual replies within threads
- Fields include: thread, content, created_at, created_by, updated_at, is_solution
- Indexed by thread for efficient retrieval

**Notification Table**
- Manages user notifications
- Fields include: user, type, content, related_record, created_at, read, read_at
- Notification types constrained to: course_update, forum_reply, review_complete, enrollment
- Indexed by user for efficient retrieval

### Indexing Strategy

Our schema implements strategic indexing to optimize the most common queries:

1. **Single-field indexes** for frequently queried individual fields:
   - User emails (unique)
   - Course titles
   - Forum category names

2. **Composite indexes** for relationship-based queries:
   - Section by course and order
   - Material by section and order
   - Quiz by section and order
   - Quiz questions by quiz and order
   - Enrollments by student and course
   - Progress by student and material
   - Forum threads by category
   - Forum posts by thread

These indexes directly support the performance requirements in the SRS by ensuring fast access to related data, especially for nested course content and user progress tracking.

### Permission Model

The schema implements a sophisticated role-based permission system that aligns with the security requirements specified in the SRS:

#### Authentication Scopes
- Separate authentication scopes for admin, educator, student, and moderator roles
- Session-based authentication with 24-hour token validity

#### Table-level Permissions
Permissions are carefully defined for each table based on user roles:

1. **User Data**
   - Users can view and update only their own data
   - Admins have full access to all user data

2. **Course Content**
   - Educators can create courses and manage only their own content
   - Students can only view published courses
   - Admins have full access to all courses

3. **Progress Data**
   - Students can track only their own progress
   - Educators can view progress for students in their courses
   - Admins have full access to all progress data

4. **Forum Content**
   - All authenticated users can create threads and posts
   - Users can edit only their own content
   - Moderators and admins can edit and delete any content
   - Thread locking prevents new posts in locked threads

5. **Quiz and Assessments**
   - Students can create and view only their own quiz attempts
   - Educators can create and manage quizzes for their own courses
   - Admins have full control over all assessment data

This permission structure ensures data privacy and access control while still allowing the collaborative features required for the platform.

## Conclusion

SurrealDB's unique combination of relational capabilities, flexible data modeling, and scalable architecture makes it an ideal choice for the Kaiju Academy platform. The database design aligns with our functional requirements while providing room for future growth and feature expansion.

As development progresses, we will continue to refine our data models, optimization strategies, and security implementations to ensure the best possible performance and user experience.