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