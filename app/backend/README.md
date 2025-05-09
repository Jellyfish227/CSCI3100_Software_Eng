# Kaiju Academy Backend Deployment

This directory contains the backend code for the Kaiju Academy learning platform, built with Rust and deployed as AWS Lambda functions using AWS SAM (Serverless Application Model).

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Rust](https://www.rust-lang.org/tools/install) and Cargo
- [cargo-lambda](https://github.com/cargo-lambda/cargo-lambda) for building Rust Lambda functions
- A running SurrealDB instance on AWS (EC2, ECS, or other service)

## Building and Deploying

1. Install cargo-lambda if you haven't already:
   ```
   cargo install cargo-lambda
   ```

2. Build the Rust Lambda functions:
   ```
   cargo lambda build --release
   ```

3. Deploy using SAM:
   ```
   sam deploy --guided
   ```

   During the guided deployment, you'll be prompted to provide:
   - Stack name (e.g., kaiju-academy)
   - AWS Region
   - SurrealDB connection details:
     - SurrealDBHost: Your SurrealDB host address
     - SurrealDBPort: Your SurrealDB port (default: 8000)
     - SurrealDBUser: Your SurrealDB username
     - SurrealDBPassword: Your SurrealDB password
     - SurrealDBNamespace: Your SurrealDB namespace
     - SurrealDBDatabase: Your SurrealDB database name
   - Confirmation for IAM role creation

## API Endpoints

The deployment creates the following API endpoints:

### Authentication
- POST /auth/login - User login
- POST /auth/register - User registration
- POST /auth/refresh - Refresh authentication token

### Users
- GET /users - List users
- GET /users/{id} - Get user by ID
- PUT /users/{id} - Update user

### Courses
- GET /courses - List courses
- GET /courses/{id} - Get course by ID
- POST /courses - Create course
- PUT /courses/{id} - Update course
- DELETE /courses/{id} - Delete course

### Quizzes
- GET /quizzes - List quizzes
- GET /quizzes/{id} - Get quiz by ID
- POST /quizzes - Create quiz
- POST /quizzes/{id}/submit - Submit quiz answers

### Code Execution
- POST /code/execute - Execute code
- POST /code/submit - Submit solution

### Forum
- GET /forum/posts - List forum posts
- GET /forum/posts/{id} - Get forum post by ID
- POST /forum/posts - Create forum post
- POST /forum/posts/{id}/comments - Add comment to forum post

## Monitoring and Logs

To view logs for a specific function:
```
sam logs -n AuthFunction --stack-name kaiju-academy
```

Replace `AuthFunction` with the name of the function you want to monitor.

## Local Testing

You can test the API locally using SAM CLI:
```
sam local start-api --parameter-overrides SurrealDBHost=localhost
```

This will start a local API Gateway instance on port 3000. Make sure your local environment has a running SurrealDB instance for testing. 