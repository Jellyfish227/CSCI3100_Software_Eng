import { Course } from '@/types/course';
import { User } from '../lib/auth';
import { CourseContent, CourseContentCreateData, CourseContentList, CourseContentUpdateData } from '@/types/courseContent';

// Base API URL configuration
// For local development with the proxy in vite.config.ts, keep it as '/api'
// This will be automatically proxied to http://localhost:3000 as configured in vite.config.ts
//
// For production deployment, you have two options:
// 1. Keep it as '/api' and configure the production server with the same proxy setup
// 2. Set it directly to your API URL: 
//    const API_BASE_URL = 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod';
const API_BASE_URL = '/api';

export const apiService = {
  /**
   * Get list of courses with optional filtering
   * @param options Optional query parameters
   * @returns List of courses with pagination info
   */
  async getCourses(options?: {
    limit?: number;
    page?: number;
    published?: boolean;
    search?: string;
    educator?: string;
    category?: string;
    difficulty?: string;
  }): Promise<{ courses: Course[], pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (options) {
        if (options.limit) queryParams.append('limit', options.limit.toString());
        if (options.page) queryParams.append('page', options.page.toString());
        if (options.published !== undefined) queryParams.append('published', options.published.toString());
        if (options.search) queryParams.append('search', options.search);
        if (options.educator) queryParams.append('educator', options.educator);
        if (options.category) queryParams.append('category', options.category);
        if (options.difficulty) queryParams.append('difficulty', options.difficulty);
      }
      
      const url = `${API_BASE_URL}/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      return {
        courses: data.courses,
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  /**
   * Get a specific course by ID
   * @param id Course ID
   * @returns Course details
   */
  async getCourse(id: string): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const data = await response.json();
      return data.course;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new course
   * @param courseData Course data
   * @returns Created course
   */
  async createCourse(courseData: {
    title: string;
    description: string;
    difficulty: string;
    category: string;
    tags?: string[];
    thumbnail?: string;
    is_published?: boolean;
    duration_hours?: number;
    price?: number;
  }): Promise<Course> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }
      
      const data = await response.json();
      return data.course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  /**
   * Update an existing course
   * @param id Course ID
   * @param courseData Updated course data
   * @returns Updated course
   */
  async updateCourse(id: string, courseData: {
    title?: string;
    description?: string;
    difficulty?: string;
    category?: string;
    tags?: string[];
    thumbnail?: string;
    is_published?: boolean;
    duration_hours?: number;
    price?: number;
  }): Promise<Course> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course');
      }
      
      const data = await response.json();
      return data.course;
    } catch (error) {
      console.error(`Error updating course ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a course
   * @param id Course ID
   * @returns Success message
   */
  async deleteCourse(id: string): Promise<string> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get course content for a specific course
   * @param id Course ID
   * @returns Course content organized by topics
   */
  async getCourseContent(id: string): Promise<CourseContentList> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}/content`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course content');
      }
      
      const data = await response.json();
      console.log("API getCourseContent response:", data);
      
      // Return the data directly since it already has the correct structure
      return data;
    } catch (error) {
      console.error(`Error fetching course content for course ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add new content to a course
   * @param courseId Course ID
   * @param contentData Content data to add
   * @returns The created content item
   */
  async addCourseContent(courseId: string, contentData: CourseContentCreateData): Promise<CourseContent> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add course content');
      }
      
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error adding course content:', error);
      throw error;
    }
  },

  /**
   * Update course content
   * @param contentId Content ID
   * @param contentData Updated content data
   * @returns The updated content item
   */
  async updateCourseContent(contentId: string, contentData: CourseContentUpdateData): Promise<CourseContent> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course content');
      }
      
      const data = await response.json();
      return data.body.content;
    } catch (error) {
      console.error(`Error updating course content ${contentId}:`, error);
      throw error;
    }
  },

  /**
   * Delete course content
   * @param contentId Content ID
   * @returns Success message
   */
  async deleteCourseContent(contentId: string): Promise<string> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course content');
      }
      
      const data = await response.json();
      return data.body.message;
    } catch (error) {
      console.error(`Error deleting course content ${contentId}:`, error);
      throw error;
    }
  },

  /**
   * Execute code
   * @param code Code to execute
   * @param language Programming language
   * @param input Optional input data
   * @returns Execution results
   */
  async executeCode(code: string, language: string, input?: string): Promise<{
    output: string;
    executionTime: number;
    memoryUsed: number;
  }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/code/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          input
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Code execution failed');
      }
      
      const data = await response.json();
      return {
        output: data.output,
        executionTime: data.executionTime,
        memoryUsed: data.memoryUsed
      };
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  },

  /**
   * Evaluate code against test cases
   * @param code Code to evaluate
   * @param language Programming language
   * @param testCases Test cases
   * @returns Evaluation results
   */
  async evaluateCode(code: string, language: string, testCases: Array<{
    input: any;
    expectedOutput: any;
  }>): Promise<{
    passed: boolean;
    results: Array<{
      input: any;
      expectedOutput: any;
      actualOutput: any;
      passed: boolean;
    }>;
    executionTime: number;
    memoryUsed: number;
  }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/code/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          testCases
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Code evaluation failed');
      }
      
      const data = await response.json();
      return {
        passed: data.passed,
        results: data.results,
        executionTime: data.executionTime,
        memoryUsed: data.memoryUsed
      };
    } catch (error) {
      console.error('Error evaluating code:', error);
      throw error;
    }
  },

  /**
   * Get Featured Course  
   * @returns Featured Course
   */
  async getFeaturedCourse(): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured course');
      }
      const data = await response.json();
      return data.featured_course;
    } catch (error) {
      console.error('Error fetching featured course:', error);
      throw error;
    }
  },

  /**
   * Log in a user
   * @param email User's email
   * @param password User's password
   * @returns User data with token
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Map backend user data to our frontend User type
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role === 'educator' ? 'educator' : 'student',
      };

      return { user, token: data.token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Alias for register to maintain backward compatibility
   */
  async signup(email: string, password: string, name: string, role: "student" | "educator"): Promise<{ user: User; token: string }> {
    const { user } = await this.register({ email, password, name, role });
    // After registration, perform a login to get the token
    const loginResult = await this.login(email, password);
    return loginResult;
  },

  /**
   * Register a new user
   * @param userData User registration data
   * @returns User data
   */
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: "student" | "educator";
    bio?: string;
    profile_image?: string;
  }): Promise<{ user: User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Map backend user data to our frontend User type
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role === 'educator' ? 'educator' : 'student',
      };

      return { user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Validate the current auth token and get user data
   * @returns User data if token is valid
   */
  async validateToken(token: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const data = await response.json();
      
      // Map backend user data to our frontend User type
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || 'User',
        role: data.user.role === 'educator' ? 'educator' : 'student',
      };
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  },

  /**
   * Check if the current user is authenticated
   * @returns Boolean indicating if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get the current auth token
   * @returns The current auth token or null
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  /**
   * Remove the auth token and log out
   */
  logout(): void {
    localStorage.removeItem('authToken');
  },

  /**
   * Update user profile
   * @param profileData Profile data to update
   * @returns Updated user data
   */
  async updateProfile(profileData: {
    name?: string;
    bio?: string;
    profile_image?: string;
    subjects?: string[];
  }): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const data = await response.json();
      
      // Map backend user data to our frontend User type
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role === 'educator' ? 'educator' : 'student',
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Get courses owned by the authenticated educator
   * @returns List of courses with pagination info
   */
  async getEducatorCourses(): Promise<{ courses: Course[], pagination: any }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Get the current user to check if they're an educator
      const userData = await this.validateToken(token);
      if (userData.role !== 'educator') {
        throw new Error('Only educators can access their courses');
      }
      
      // Use the getCourses method with the educator filter set to the user's ID
      return this.getCourses({ educator: userData.id });
    } catch (error) {
      console.error('Error fetching educator courses:', error);
      throw error;
    }
  },
}; 