# Component Design (Low Level)

## Frontend Components

### 1. **Navbar**
The **Navbar** component is responsible for displaying top navigation links such as Home, Courses, and Forum. It also handles search functionality and manages notifications and the user profile dropdown. The component takes user interactions like clicks and search queries as input and produces navigation actions, search results, and notification displays as output. The class definition in TypeScript includes methods for handling search queries, fetching notifications, and toggling the profile dropdown.

### 2. **Dashboard**
The **Dashboard** component displays enrolled courses, progress metrics, and deadlines. It also renders charts (line/pie) for activity visualization. The input for this component is API data such as course progress and deadlines, and the output is rendered UI components like cards and charts. The progress calculation algorithm used is `progress = (completedModules / totalModules) * 100`. The class definition includes methods for fetching courses and rendering charts using libraries like Recharts or MUI.

### 3. **Code Editor**
The **Code Editor** component provides syntax highlighting for code submissions, executes code in a sandboxed environment, and displays execution results. It takes code (as a string) and the programming language (as an enum) as input and produces execution results (stdout/stderr) and grades as output. The code execution algorithm involves sending the code to a backend API and awaiting sandboxed execution results. The class definition includes a method for executing code and returning the results.

## Backend Components

### 1. **Authentication Service**
The **Authentication Service** handles user registration and login, JWT token generation and validation, and role-based access control. It takes an object with email and password as input and outputs a token and user profile or an error. The service uses bcrypt for password hashing and RSA-256 for JWT generation. The Rust implementation includes methods for user registration and authentication.

### 2. **Course Management Service**
The **Course Management Service** is responsible for CRUD operations for courses and materials, organizing content into sections and modules. It takes a course object with title, description, and modules as input and outputs a course ID or error. The material ordering algorithm assigns an `order_index` based on the insertion sequence. The Rust implementation includes methods for creating and publishing courses, storing metadata in SurrealDB, and uploading files to S3.

### 3. **Assessment Service**
The **Assessment Service** executes code in sandboxed environments, auto-grades submissions against test cases, and stores grades and feedback. It takes a code submission object with code, language, and test cases as input and outputs a score and feedback. The grading algorithm compares stdout with expected output and assigns partial scores for edge cases. The Rust implementation includes a method for grading submissions and calculating scores.

### 4. **Forum Service**
The **Forum Service** manages forum threads and posts and moderates content by deleting or editing posts. It takes a post object with content and thread ID as input and outputs a post ID or moderation log entry. The Rust implementation includes methods for creating posts and moderating them by updating their status.

## Database Schema Integration

### **User Class (SurrealDB)**
The **User** table in SurrealDB is defined with fields for ID, email (with unique and format constraints), password (bcrypt hash), role (enum: student, educator, admin), and creation timestamp.

### **Course Class (SurrealDB)**
The **Course** table in SurrealDB is defined with fields for ID, title, creator (reference to a user), modules (array of references to module), and a published status (defaulting to false).

## Key Algorithms

1. **Code Execution Workflow**:
   The code execution workflow involves the user submitting code, which is then sent through an API Gateway to a Lambda function. The code is executed in a Docker container sandbox with a timeout of 5 seconds. The stdout/stderr is captured, compared with test cases, and a score is calculated.

2. **Progress Tracking**:
   The progress tracking algorithm updates the user's progress by querying the database for the number of completed and total materials in a course. The progress percentage is calculated and updated in the database.

This design ensures separation of concerns, scalability via AWS Lambda, and compliance with security and performance requirements.