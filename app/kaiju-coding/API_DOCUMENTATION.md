# Kaiju Academy API Documentation

## Authentication Endpoints

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "your_password"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Login successful",
      "token": "jwt_token_here",
      "user": {
        "id": "user:uuid",
        "email": "user@example.com",
        "name": "User Name",
        "role": "student",
        "created_at": "2024-03-21T12:00:00Z",
        "profile_image": "url_to_image",
        "bio": "User bio"
      }
    }
  }
  ```

### Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "your_password",
    "name": "New User",
    "role": "student",
    "bio": "Optional bio",
    "profile_image": "Optional image URL"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 201,
    "body": {
      "message": "Registration successful",
      "user": {
        "id": "user:uuid",
        "email": "newuser@example.com",
        "name": "New User",
        "role": "student",
        "created_at": "2024-03-21T12:00:00Z",
        "profile_image": "url_to_image",
        "bio": "User bio"
      }
    }
  }
  ```

### Validate Token
- **URL**: `/auth/validate`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "valid": true,
      "user": {
        "id": "user:uuid",
        "email": "user@example.com",
        "role": "student"
      }
    }
  }
  ```

### Update Profile
- **URL**: `/auth/profile`
- **Method**: `PUT`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
- **Body**:
  ```json
  {
    "name": "Updated Name",
    "bio": "Updated user bio information",
    "profile_image": "updated_profile_image_url"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Profile updated successfully",
      "user": {
        "id": "user:uuid",
        "email": "user@example.com",
        "name": "Updated Name",
        "role": "student",
        "created_at": "2024-03-21T12:00:00Z",
        "updated_at": "2024-05-11T14:30:00Z",
        "profile_image": "updated_profile_image_url",
        "bio": "Updated user bio information"
      }
    }
  }
  ```

### Get User
- **URL**: `/auth/user` or `/auth/user/{id}` (admin only)
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - Only admins can access other user profiles
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "user": {
        "id": "user:uuid",
        "email": "user@example.com",
        "name": "User Name",
        "role": "student",
        "created_at": "2024-03-21T12:00:00Z",
        "updated_at": "2024-05-11T14:30:00Z",
        "profile_image": "profile_image_url",
        "bio": "User bio information"
      }
    }
  }
  ```

## Course Endpoints

### List Courses
- **URL**: `/courses`
- **Method**: `GET`
- **Query Parameters**:
  - `limit` (optional): Number of courses per page (default: 100)
  - `page` (optional): Page number (default: 1)
  - `published` (optional): Filter by published status (default: true)
  - `search` (optional): Search in title, description, or tags
  - `educator` (optional): Filter by educator ID
  - `category` (optional): Filter by category
  - `difficulty` (optional): Filter by difficulty level
- **Permissions**:
  - Public access (no authentication required)
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "courses": [
        {
          "id": "course_uuid",
          "title": "Course Title",
          "description": "Course Description",
          "difficulty": "beginner",
          "category": "programming",
          "educator": {
            "id": "educator_id",
            "name": "Educator Name",
            "profile_image": "educator_image_url"
          },
          "tags": ["tag1", "tag2"],
          "thumbnail": "thumbnail_url",
          "created_at": "2024-03-21T12:00:00Z",
          "updated_at": "2024-03-21T12:00:00Z",
          "is_published": true,
          "duration_hours": 10,
          "students": [],
          "rating": 0,
          "reviews": [],
          "price": 0
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "pages": 10
      }
    }
  }
  ```

### Get Course
- **URL**: `/courses/{id}`
- **Method**: `GET`
- **Permissions**:
  - Public access (no authentication required)
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "course": {
        "id": "course_uuid",
        "title": "Course Title",
        "description": "Course Description",
        "difficulty": "beginner",
        "category": "programming",
        "educator": {
          "id": "educator_id",
          "name": "Educator Name",
          "profile_image": "educator_image_url"
        },
        "tags": ["tag1", "tag2"],
        "thumbnail": "thumbnail_url",
        "created_at": "2024-03-21T12:00:00Z",
        "updated_at": "2024-03-21T12:00:00Z",
        "is_published": true,
        "duration_hours": 10,
        "students": [],
        "rating": 0,
        "reviews": [],
        "price": 0
      }
    }
  }
  ```

### Create Course
- **URL**: `/courses`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must have role "educator"
- **Body**:
  ```json
  {
    "title": "New Course",
    "description": "Course Description",
    "difficulty": "beginner",
    "category": "programming",
    "tags": ["tag1", "tag2"],
    "thumbnail": "thumbnail_url",
    "is_published": false,
    "duration_hours": 10,
    "price": 0
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 201,
    "body": {
      "message": "Course created successfully",
      "course": {
        "id": "course_uuid",
        "title": "New Course",
        "description": "Course Description",
        "difficulty": "beginner",
        "category": "programming",
        "educator": {
          "id": "educator_id",
          "name": "Educator Name",
          "profile_image": "educator_image_url"
        },
        "tags": ["tag1", "tag2"],
        "thumbnail": "thumbnail_url",
        "created_at": "2024-03-21T12:00:00Z",
        "updated_at": "2024-03-21T12:00:00Z",
        "is_published": false,
        "duration_hours": 10,
        "students": [],
        "rating": 0,
        "reviews": [],
        "price": 0
      }
    }
  }
  ```

### Update Course
- **URL**: `/courses/{id}`
- **Method**: `PUT`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the course owner (educator)
- **Body**:
  ```json
  {
    "title": "Updated Course Title",
    "description": "Updated Description",
    "difficulty": "intermediate",
    "category": "programming",
    "tags": ["updated_tag1", "updated_tag2"],
    "thumbnail": "updated_thumbnail_url",
    "is_published": true,
    "duration_hours": 15,
    "price": 29.99
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Course updated successfully",
      "course": {
        "id": "course_uuid",
        "title": "Updated Course Title",
        "description": "Updated Description",
        "difficulty": "intermediate",
        "category": "programming",
        "educator": {
          "id": "educator_id",
          "name": "Educator Name",
          "profile_image": "educator_image_url"
        },
        "tags": ["updated_tag1", "updated_tag2"],
        "thumbnail": "updated_thumbnail_url",
        "created_at": "2024-03-21T12:00:00Z",
        "updated_at": "2024-03-21T12:30:00Z",
        "is_published": true,
        "duration_hours": 15,
        "students": [],
        "rating": 0,
        "reviews": [],
        "price": 29.99
      }
    }
  }
  ```

### Delete Course
- **URL**: `/courses/{id}`
- **Method**: `DELETE`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the course owner (educator)
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Course deleted successfully"
    }
  }
  ```

## Course Content Endpoints

### Get Course Content
- **URL**: `/courses/{id}/content`
- **Method**: `GET`
- **Permissions**:
  - Public access (no authentication required)
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "courseId": "course_uuid",
      "topics": [
        {
          "name": "Getting Started with Python",
          "entries": [
            {
              "id": "content:uuid1",
              "course_id": "course_uuid",
              "topic": "Getting Started with Python",
              "title": "Introduction to Python",
              "type": "video",
              "description": "Overview of Python and its applications",
              "content": "Video URL or embed code",
              "duration_minutes": 15,
              "order": 1,
              "status": "published",
              "created_at": "2024-05-11T14:30:00Z",
              "updated_at": "2024-05-11T14:30:00Z",
              "resources": []
            },
            {
              "id": "content:uuid2",
              "course_id": "course_uuid",
              "topic": "Getting Started with Python",
              "title": "Setting up your Python Environment",
              "type": "tutorial",
              "description": "Install Python and set up your development environment",
              "content": "Markdown content...",
              "duration_minutes": 20,
              "order": 2,
              "status": "published",
              "created_at": "2024-05-11T14:35:00Z",
              "updated_at": "2024-05-11T14:35:00Z",
              "resources": []
            }
          ]
        },
        {
          "name": "Python Fundamentals",
          "entries": [
            {
              "id": "content:uuid3",
              "course_id": "course_uuid",
              "topic": "Python Fundamentals",
              "title": "Variables and Data Types",
              "type": "lesson",
              "description": "Learn about Python's basic data types and variables",
              "content": "Markdown content...",
              "duration_minutes": 25,
              "order": 3,
              "status": "published",
              "created_at": "2024-05-11T14:40:00Z",
              "updated_at": "2024-05-11T14:40:00Z",
              "resources": []
            }
          ]
        }
      ]
    }
  }
  ```

### Add Course Content
- **URL**: `/courses/{id}/content`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the course owner (educator)
- **Body**:
  ```json
  {
    "topic": "Getting Started with Python",
    "title": "Introduction to Python",
    "type": "video",
    "description": "Overview of Python and its applications",
    "content": "Video URL or embed code",
    "duration_minutes": 15,
    "status": "published",
    "resources": []
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 201,
    "body": {
      "message": "Content added successfully",
      "content": {
        "id": "content:uuid",
        "course_id": "course_uuid",
        "topic": "Getting Started with Python",
        "title": "Introduction to Python",
        "type": "video",
        "description": "Overview of Python and its applications",
        "content": "Video URL or embed code",
        "duration_minutes": 15,
        "order": 1,
        "status": "published",
        "created_at": "2024-05-11T14:30:00Z",
        "updated_at": "2024-05-11T14:30:00Z",
        "resources": []
      }
    }
  }
  ```

### Update Course Content
- **URL**: `/courses/content/{id}`
- **Method**: `PUT`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the course owner (educator)
- **Body**:
  ```json
  {
    "title": "Updated Introduction to Python",
    "description": "Updated overview of Python and its applications",
    "content": "Updated video URL or embed code",
    "duration_minutes": 20,
    "status": "published"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Content updated successfully",
      "content": {
        "id": "content:uuid",
        "course_id": "course_uuid",
        "topic": "Getting Started with Python",
        "title": "Updated Introduction to Python",
        "type": "video",
        "description": "Updated overview of Python and its applications",
        "content": "Updated video URL or embed code",
        "duration_minutes": 20,
        "order": 1,
        "status": "published",
        "created_at": "2024-05-11T14:30:00Z",
        "updated_at": "2024-05-11T15:00:00Z",
        "resources": []
      }
    }
  }
  ```

### Delete Course Content
- **URL**: `/courses/content/{id}`
- **Method**: `DELETE`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the course owner (educator)
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Content deleted successfully"
    }
  }
  ```

## Code Execution Endpoints

### Execute Code
- **URL**: `/code/execute`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Body**:
  ```json
  {
    "code": "console.log('Hello, World!');",
    "language": "javascript",
    "input": "optional input data"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "output": "Hello, World!",
      "executionTime": 0.123,
      "memoryUsed": 1024
    }
  }
  ```

### Evaluate Code
- **URL**: `/code/evaluate`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Body**:
  ```json
  {
    "code": "function add(a, b) { return a + b; }",
    "language": "javascript",
    "testCases": [
      {
        "input": [1, 2],
        "expectedOutput": 3
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "passed": true,
      "results": [
        {
          "input": [1, 2],
          "expectedOutput": 3,
          "actualOutput": 3,
          "passed": true
        }
      ],
      "executionTime": 0.123,
      "memoryUsed": 1024
    }
  }
  ```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "body": {
    "error": "Bad Request",
    "message": "Detailed error message"
  }
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "body": {
    "error": "Authentication Error",
    "message": "Invalid or missing authentication token"
  }
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "body": {
    "error": "Authorization Error",
    "message": "You do not have permission to perform this action. Only course owners can modify or delete their courses."
  }
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "body": {
    "error": "Not Found",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "body": {
    "error": "Internal Server Error",
    "message": "An unexpected error occurred"
  }
}
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

The token can be obtained by calling the `/auth/login` endpoint with valid credentials.

## Rate Limiting

API requests are subject to rate limiting. The current limits are:
- 1000 requests per minute per IP address
- 100 requests per minute per authenticated user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1616342400
```

## Course Enrollment Endpoints

### Enroll in Course
- **URL**: `/courses/{id}/enroll`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must have role "student"
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Successfully enrolled in course",
      "enrollment": {
        "id": "enrollment:uuid",
        "course_id": "course:uuid",
        "student_id": "user:uuid",
        "enrolled_at": "2024-05-15T09:30:00Z",
        "progress": 0,
        "status": "active"
      }
    }
  }
  ```

### Unenroll from Course
- **URL**: `/courses/{id}/unenroll`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be enrolled in the course
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Successfully unenrolled from course"
    }
  }
  ```

### Get Student Courses
- **URL**: `/courses/enrolled`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "courses": [
        {
          "id": "course:uuid",
          "title": "Course Title",
          "description": "Course Description",
          "educator": {
            "id": "user:uuid",
            "name": "Educator Name"
          },
          "enrollment": {
            "id": "enrollment:uuid",
            "enrolled_at": "2024-05-15T09:30:00Z",
            "progress": 35,
            "status": "active",
            "last_accessed": "2024-05-17T14:20:00Z"
          },
          "thumbnail": "thumbnail_url"
        }
      ]
    }
  }
  ```

### Update Course Progress
- **URL**: `/courses/{id}/progress`
- **Method**: `PUT`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be enrolled in the course
- **Body**:
  ```json
  {
    "content_id": "content:uuid",
    "completed": true
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Progress updated",
      "progress": {
        "course_id": "course:uuid",
        "student_id": "user:uuid",
        "overall_progress": 45,
        "completed_content": ["content:uuid1", "content:uuid2", "content:uuid3"],
        "last_accessed": "2024-05-17T15:30:00Z"
      }
    }
  }
  ```

## Assignment and Assessment Endpoints

### Create Assignment
- **URL**: `/courses/{id}/assignments`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the course owner (educator)
- **Body**:
  ```json
  {
    "title": "Assignment Title",
    "description": "Assignment description and instructions",
    "due_date": "2024-06-01T23:59:59Z",
    "points": 100,
    "content": "Markdown content with assignment details",
    "attachment_urls": ["url1", "url2"],
    "related_content_ids": ["content:uuid1"]
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 201,
    "body": {
      "message": "Assignment created successfully",
      "assignment": {
        "id": "assignment:uuid",
        "course_id": "course:uuid",
        "title": "Assignment Title",
        "description": "Assignment description and instructions",
        "due_date": "2024-06-01T23:59:59Z",
        "points": 100,
        "content": "Markdown content with assignment details",
        "attachment_urls": ["url1", "url2"],
        "related_content_ids": ["content:uuid1"],
        "created_at": "2024-05-17T10:00:00Z",
        "updated_at": "2024-05-17T10:00:00Z"
      }
    }
  }
  ```

### Get Course Assignments
- **URL**: `/courses/{id}/assignments`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be enrolled in the course or be the course owner
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "assignments": [
        {
          "id": "assignment:uuid",
          "course_id": "course:uuid",
          "title": "Assignment Title",
          "description": "Assignment description and instructions",
          "due_date": "2024-06-01T23:59:59Z",
          "points": 100,
          "attachment_urls": ["url1", "url2"],
          "created_at": "2024-05-17T10:00:00Z",
          "updated_at": "2024-05-17T10:00:00Z",
          "submission_status": "not_submitted"
        }
      ]
    }
  }
  ```

### Get Assignment Details
- **URL**: `/courses/assignments/{id}`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be enrolled in the course or be the course owner
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "assignment": {
        "id": "assignment:uuid",
        "course_id": "course:uuid",
        "title": "Assignment Title",
        "description": "Assignment description and instructions",
        "due_date": "2024-06-01T23:59:59Z",
        "points": 100,
        "content": "Markdown content with assignment details",
        "attachment_urls": ["url1", "url2"],
        "related_content_ids": ["content:uuid1"],
        "created_at": "2024-05-17T10:00:00Z",
        "updated_at": "2024-05-17T10:00:00Z"
      }
    }
  }
  ```

### Submit Assignment
- **URL**: `/courses/assignments/{id}/submit`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be enrolled in the course
- **Body**:
  ```json
  {
    "submission_text": "Markdown content of the submission",
    "attachment_urls": ["url1", "url2"]
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 201,
    "body": {
      "message": "Assignment submitted successfully",
      "submission": {
        "id": "submission:uuid",
        "assignment_id": "assignment:uuid",
        "student_id": "user:uuid",
        "submission_text": "Markdown content of the submission",
        "attachment_urls": ["url1", "url2"],
        "submitted_at": "2024-05-20T14:30:00Z",
        "status": "submitted",
        "grade": null,
        "feedback": null
      }
    }
  }
  ```

### Grade Assignment
- **URL**: `/courses/assignments/{assignment_id}/submissions/{submission_id}/grade`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the course owner (educator)
- **Body**:
  ```json
  {
    "grade": 85,
    "feedback": "Good work, but could improve in these areas..."
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Submission graded successfully",
      "submission": {
        "id": "submission:uuid",
        "assignment_id": "assignment:uuid",
        "student_id": "user:uuid",
        "submitted_at": "2024-05-20T14:30:00Z",
        "status": "graded",
        "grade": 85,
        "feedback": "Good work, but could improve in these areas...",
        "graded_at": "2024-05-22T10:15:00Z",
        "graded_by": "user:educator_uuid"
      }
    }
  }
  ```

### Create Assessment
- **URL**: `/courses/{id}/assessments`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the course owner (educator)
- **Body**:
  ```json
  {
    "title": "Chapter 1 Quiz",
    "description": "Test your knowledge of the basics",
    "time_limit_minutes": 30,
    "passing_score": 70,
    "due_date": "2024-06-05T23:59:59Z",
    "questions": [
      {
        "question": "What is Python?",
        "type": "multiple_choice",
        "options": ["A programming language", "A snake", "A database", "An IDE"],
        "correct_answer": 0,
        "points": 10
      },
      {
        "question": "Explain the difference between lists and tuples in Python",
        "type": "essay",
        "points": 20
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 201,
    "body": {
      "message": "Assessment created successfully",
      "assessment": {
        "id": "assessment:uuid",
        "course_id": "course:uuid",
        "title": "Chapter 1 Quiz",
        "description": "Test your knowledge of the basics",
        "time_limit_minutes": 30,
        "passing_score": 70,
        "due_date": "2024-06-05T23:59:59Z",
        "created_at": "2024-05-17T11:00:00Z",
        "updated_at": "2024-05-17T11:00:00Z",
        "questions": [
          {
            "id": "question:uuid1",
            "question": "What is Python?",
            "type": "multiple_choice",
            "options": ["A programming language", "A snake", "A database", "An IDE"],
            "points": 10
          },
          {
            "id": "question:uuid2",
            "question": "Explain the difference between lists and tuples in Python",
            "type": "essay",
            "points": 20
          }
        ]
      }
    }
  }
  ```

### Take Assessment
- **URL**: `/courses/assessments/{id}/take`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be enrolled in the course
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "assessment": {
        "id": "assessment:uuid",
        "title": "Chapter 1 Quiz",
        "description": "Test your knowledge of the basics",
        "time_limit_minutes": 30,
        "due_date": "2024-06-05T23:59:59Z",
        "questions": [
          {
            "id": "question:uuid1",
            "question": "What is Python?",
            "type": "multiple_choice",
            "options": ["A programming language", "A snake", "A database", "An IDE"],
            "points": 10
          },
          {
            "id": "question:uuid2",
            "question": "Explain the difference between lists and tuples in Python",
            "type": "essay",
            "points": 20
          }
        ],
        "start_time": "2024-05-23T14:00:00Z",
        "end_time": "2024-05-23T14:30:00Z"
      }
    }
  }
  ```

### Submit Assessment
- **URL**: `/courses/assessments/{id}/submit`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be enrolled in the course
- **Body**:
  ```json
  {
    "answers": [
      {
        "question_id": "question:uuid1",
        "answer": 0
      },
      {
        "question_id": "question:uuid2",
        "answer": "Lists are mutable while tuples are immutable. This means you can modify lists after creation but tuples remain unchanged."
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "Assessment submitted successfully",
      "result": {
        "id": "result:uuid",
        "assessment_id": "assessment:uuid",
        "student_id": "user:uuid",
        "score": 85,
        "passed": true,
        "submitted_at": "2024-05-23T14:25:00Z",
        "time_taken_minutes": 25,
        "answers": [
          {
            "question_id": "question:uuid1",
            "answer": 0,
            "correct": true,
            "points_earned": 10
          },
          {
            "question_id": "question:uuid2",
            "answer": "Lists are mutable while tuples are immutable. This means you can modify lists after creation but tuples remain unchanged.",
            "points_earned": 15,
            "feedback": "Good explanation but could have mentioned more differences"
          }
        ]
      }
    }
  }
  ```

## File Upload Endpoints

### Upload File
- **URL**: `/upload`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  Content-Type: multipart/form-data
  ```
- **Form Data**:
  - `file`: The file to upload (required)
  - `type`: Type of file being uploaded (required) - Options: "thumbnail", "content", "assignment_submission", "profile_image", "course_resource"
  - `description`: Description of the file (optional)
  - `related_id`: ID of related entity (course_id, assignment_id, etc.) (required)
- **Permissions**:
  - Requires authentication
  - Permission requirements vary based on the file type and related entity
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "File uploaded successfully",
      "file": {
        "id": "file:uuid",
        "filename": "original_filename.jpg",
        "url": "https://example.com/files/uuid/filename.jpg",
        "type": "thumbnail",
        "size_bytes": 256000,
        "mime_type": "image/jpeg",
        "description": "Course thumbnail image",
        "related_id": "course:uuid",
        "uploaded_by": "user:uuid",
        "uploaded_at": "2024-05-17T16:30:00Z"
      }
    }
  }
  ```

### Get Files
- **URL**: `/files`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Query Parameters**:
  - `related_id`: ID of related entity (course_id, assignment_id, etc.)
  - `type`: Type of files to retrieve (thumbnail, content, etc.)
- **Permissions**:
  - Requires authentication
  - Permission requirements vary based on the file type and related entity
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "files": [
        {
          "id": "file:uuid1",
          "filename": "course_thumbnail.jpg",
          "url": "https://example.com/files/uuid1/course_thumbnail.jpg",
          "type": "thumbnail",
          "size_bytes": 256000,
          "mime_type": "image/jpeg",
          "description": "Course thumbnail image",
          "related_id": "course:uuid",
          "uploaded_by": "user:uuid",
          "uploaded_at": "2024-05-17T16:30:00Z"
        },
        {
          "id": "file:uuid2",
          "filename": "lecture_slides.pdf",
          "url": "https://example.com/files/uuid2/lecture_slides.pdf",
          "type": "content",
          "size_bytes": 1024000,
          "mime_type": "application/pdf",
          "description": "Lecture slides for Module 1",
          "related_id": "content:uuid",
          "uploaded_by": "user:uuid",
          "uploaded_at": "2024-05-17T16:35:00Z"
        }
      ]
    }
  }
  ```

### Delete File
- **URL**: `/files/{id}`
- **Method**: `DELETE`
- **Headers**:
  ```
  Authorization: Bearer your_jwt_token
  ```
- **Permissions**:
  - Requires authentication
  - User must be the file owner or have appropriate permissions
- **Response**:
  ```json
  {
    "statusCode": 200,
    "body": {
      "message": "File deleted successfully"
    }
  }
  ``` 