# Frontend Authentication Setup for Kaiju Academy

This document provides instructions on how to set up authentication in your frontend application to work with the backend API's IAM authentication.

## 1. Install Required Packages

First, install the AWS Amplify library in your frontend project:

```bash
# For npm
npm install aws-amplify

# For yarn
yarn add aws-amplify
```

## 2. Configure Amplify

Create a configuration file in your frontend project (e.g., `src/aws-config.js`):

```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  // API Gateway configuration
  API: {
    endpoints: [
      {
        name: 'KaijuAcademyApi',
        endpoint: 'https://YOUR_API_GATEWAY_ID.execute-api.YOUR_REGION.amazonaws.com/prod',
        region: 'YOUR_REGION'
      },
    ]
  },
  // Auth configuration - using the JWT token directly
  Auth: {
    // No Cognito configuration needed since we're using our own JWT
  }
});

export default Amplify;
```

Replace:
- `YOUR_API_GATEWAY_ID` with the actual API Gateway ID from your deployment
- `YOUR_REGION` with your AWS region (e.g., `us-east-1`)

## 3. Create Auth Service

Create an authentication service (e.g., `src/services/auth.js`):

```javascript
import { API } from 'aws-amplify';

// Token storage keys
const AUTH_TOKEN_KEY = 'kaiju_auth_token';
const AUTH_USER_KEY = 'kaiju_auth_user';

class AuthService {
  // Store auth data in localStorage
  static setAuthData(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  // Get stored token
  static getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  // Get stored user
  static getUser() {
    const userJson = localStorage.getItem(AUTH_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Clear auth data (logout)
  static clearAuthData() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!this.getToken();
  }

  // Login
  static async login(email, password) {
    try {
      const response = await API.post('KaijuAcademyApi', '/auth/login', {
        body: { email, password }
      });
      
      const { token, user } = response;
      this.setAuthData(token, user);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  // Register
  static async register(userData) {
    try {
      const response = await API.post('KaijuAcademyApi', '/auth/register', {
        body: userData
      });
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  // Logout
  static logout() {
    this.clearAuthData();
  }
}

export default AuthService;
```

## 4. Create API Service

Create an API service for making authenticated requests (e.g., `src/services/api.js`):

```javascript
import { API } from 'aws-amplify';
import AuthService from './auth';

class ApiService {
  // Helper to add auth headers
  static getAuthHeaders() {
    const token = AuthService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // GET request
  static async get(path, queryParams = {}) {
    try {
      return await API.get('KaijuAcademyApi', path, {
        headers: this.getAuthHeaders(),
        queryStringParameters: queryParams
      });
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // POST request
  static async post(path, data) {
    try {
      return await API.post('KaijuAcademyApi', path, {
        headers: this.getAuthHeaders(),
        body: data
      });
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // PUT request
  static async put(path, data) {
    try {
      return await API.put('KaijuAcademyApi', path, {
        headers: this.getAuthHeaders(),
        body: data
      });
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // DELETE request
  static async delete(path) {
    try {
      return await API.del('KaijuAcademyApi', path, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // Error handler
  static handleApiError(error) {
    // If we get a 401 error, clear auth data (force logout)
    if (error.response && error.response.status === 401) {
      AuthService.clearAuthData();
      window.location.href = '/login'; // Redirect to login page
    }
  }
}

export default ApiService;
```

## 5. Using the API Service

Now you can use the API service in your components:

```javascript
import ApiService from '../services/api';
import AuthService from '../services/auth';

// Example: Login
async function handleLogin(email, password) {
  const result = await AuthService.login(email, password);
  if (result.success) {
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } else {
    // Show error message
    alert(result.error);
  }
}

// Example: Get courses
async function fetchCourses() {
  try {
    const response = await ApiService.get('/courses');
    return response.courses;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
}

// Example: Create course
async function createCourse(courseData) {
  try {
    const response = await ApiService.post('/courses', courseData);
    return response.course;
  } catch (error) {
    console.error('Failed to create course:', error);
    throw error;
  }
}
```

## 6. Protecting Routes

In your router configuration, add route guards to protect authenticated routes:

```javascript
// Example for React Router
function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        AuthService.isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
}

// In your routes definition:
<Switch>
  <Route path="/login" component={Login} />
  <Route path="/register" component={Register} />
  <PrivateRoute path="/dashboard" component={Dashboard} />
  <PrivateRoute path="/courses/create" component={CreateCourse} />
  <PrivateRoute path="/courses/:id/edit" component={EditCourse} />
  <Route path="/courses/:id" component={ViewCourse} />
  <Route path="/courses" component={CourseList} />
</Switch>
```

## 7. Roles-based Access Control

Add role-based checks to prevent students from accessing educator features:

```javascript
// Example check for educator role
function isEducator() {
  const user = AuthService.getUser();
  return user && user.role === 'educator';
}

// In your component
function CreateCourseButton() {
  if (!isEducator()) {
    return null; // Don't show button if not an educator
  }
  
  return <button onClick={navigateToCreateCourse}>Create Course</button>;
}
```

## Important Notes

1. This setup uses JWT tokens stored in localStorage. For a production application, consider more secure alternatives like HttpOnly cookies.

2. The backend expects:
   - Authentication via Bearer token in the Authorization header
   - Course creation is restricted to educators
   - Course updates and deletions are restricted to the course owner

3. Add proper error handling and loading states in your UI components when making API calls.

4. The API responses will include user roles and IDs which you should use to control UI elements based on permissions. 