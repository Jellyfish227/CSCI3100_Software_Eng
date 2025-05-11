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

// Check if we're in production environment
const isProduction = import.meta.env.PROD;

// Use the appropriate API URL based on environment
const API_BASE_URL = isProduction 
  ? 'https://11l6evus32.execute-api.ap-southeast-1.amazonaws.com/Stage' // Your API Gateway URL
  : '/api'; // Local development with proxy

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
      console.log(`getCourse - Fetching course with ID: ${id}`);
      const response = await fetch(`${API_BASE_URL}/courses/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const data = await response.json();
      console.log(`getCourse - Response data:`, data);
      
      // Handle different response formats
      const courseData = data.course || data.body?.course || data;
      
      if (!courseData) {
        throw new Error('Invalid course data format returned from API');
      }
      
      return courseData;
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
      console.log("Update content response:", data);
      return data.content;
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
      console.log("Delete content response:", data);
      return data.message;
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
    try {
      const { user } = await this.register({ email, password, name, role });
      console.log("Signup user:", user);
      const loginResult = await this.login(email, password);
      return loginResult;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
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

  /**
   * Enroll a student in a course
   * @param courseId Course ID to enroll in
   * @returns Enrollment details
   */
  async enrollInCourse(courseId: string): Promise<{
    id: string;
    course_id: string;
    student_id: string;
    enrolled_at: string;
    progress: number;
    status: string;
  }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enroll in course');
      }
      
      const data = await response.json();
      return data.enrollment;
    } catch (error) {
      console.error(`Error enrolling in course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Unenroll a student from a course
   * @param courseId Course ID to unenroll from
   * @returns Success message
   */
  async unenrollFromCourse(courseId: string): Promise<string> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/unenroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unenroll from course');
      }
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error(`Error unenrolling from course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Get courses the student is enrolled in
   * @returns List of enrolled courses
   */
  async getEnrolledCourses(): Promise<{
    id: string;
    title: string;
    description: string;
    educator: {
      id: string;
      name: string;
    };
    enrollment: {
      id: string;
      enrolled_at: string;
      progress: number;
      status: string;
      last_accessed: string;
    };
    thumbnail: string;
  }[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/enrolled`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get enrolled courses');
      }
      
      const data = await response.json();
      return data.courses;
    } catch (error) {
      console.error('Error getting enrolled courses:', error);
      throw error;
    }
  },

  /**
   * Update course progress
   * @param courseId Course ID
   * @param progressData Progress data
   * @returns Updated progress information
   */
  async updateCourseProgress(courseId: string, progressData: {
    content_id: string;
    completed: boolean;
  }): Promise<{
    course_id: string;
    student_id: string;
    overall_progress: number;
    completed_content: string[];
    last_accessed: string;
  }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(progressData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course progress');
      }
      
      const data = await response.json();
      return data.progress;
    } catch (error) {
      console.error(`Error updating course progress for ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Get assignments for a course
   * @param courseId Course ID
   * @returns List of assignments
   */
  async getCourseAssignments(courseId: string): Promise<any[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assignments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch course assignments');
      }
      
      const data = await response.json();
      return data.assignments;
    } catch (error) {
      console.error(`Error fetching assignments for course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Get details of a specific assignment
   * @param assignmentId Assignment ID
   * @returns Assignment details
   */
  async getAssignment(assignmentId: string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/assignments/${assignmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch assignment details');
      }
      
      const data = await response.json();
      return data.assignment;
    } catch (error) {
      console.error(`Error fetching assignment ${assignmentId}:`, error);
      throw error;
    }
  },

  /**
   * Submit an assignment
   * @param assignmentId Assignment ID
   * @param submissionData Submission data
   * @returns Submission details
   */
  async submitAssignment(assignmentId: string, submissionData: any): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit assignment');
      }
      
      const data = await response.json();
      return data.submission;
    } catch (error) {
      console.error(`Error submitting assignment ${assignmentId}:`, error);
      throw error;
    }
  },

  /**
   * Get assessments for a course
   * @param courseId Course ID
   * @returns List of assessments
   */
  async getCourseAssessments(courseId: string): Promise<any[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assessments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch course assessments');
      }
      
      const data = await response.json();
      return data.assessments;
    } catch (error) {
      console.error(`Error fetching assessments for course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Get an assessment to take (for students)
   * @param assessmentId Assessment ID
   * @returns Assessment with questions
   */
  async takeAssessment(assessmentId: string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/assessments/${assessmentId}/take`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch assessment');
      }
      
      const data = await response.json();
      return data.assessment;
    } catch (error) {
      console.error(`Error fetching assessment ${assessmentId}:`, error);
      throw error;
    }
  },

  /**
   * Submit an assessment
   * @param assessmentId Assessment ID
   * @param answers Student's answers
   * @returns Assessment result
   */
  async submitAssessment(assessmentId: string, answers: any[]): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit assessment');
      }
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error submitting assessment ${assessmentId}:`, error);
      throw error;
    }
  },

  /**
   * Get a presigned URL for file upload
   * @param file The file to upload
   * @param type File type (thumbnail, content, assignment_submission, profile_image, course_resource)
   * @param relatedId ID of the related entity (course_id, assignment_id, etc.)
   * @param description Optional description of the file
   * @returns Presigned URL and file metadata
   */
  async getPresignedUrl(
    file: File,
    type: "thumbnail" | "content" | "assignment_submission" | "profile_image" | "course_resource",
    relatedId: string,
    description?: string
  ): Promise<{
    presignedUrl: string;
    file: {
      id: string;
      filename: string;
      url: string;
      type: string;
      size_bytes: number;
      mime_type: string;
      description?: string;
      related_id: string;
      uploaded_by: string;
      uploaded_at: string;
      status: string;
    }
  }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Validate required parameters
      if (!relatedId) {
        throw new Error('Related ID is required');
      }

      if (!file) {
        throw new Error('File is required');
      }

      // Request a presigned URL
      const response = await fetch(`${API_BASE_URL}/files/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          type: type,
          relatedId: relatedId,
          description: description,
          size: file.size
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.body?.message || 'Failed to get presigned URL');
      }

      const data = await response.json();
      const result = data.body || data;
      
      return {
        presignedUrl: result.presignedUrl,
        file: result.file
      };
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw error;
    }
  },

  /**
   * Upload file directly to S3 using presigned URL
   * @param presignedUrl The presigned URL for the S3 upload
   * @param file The file to upload
   * @returns True if upload was successful
   */
  async uploadToS3(presignedUrl: string, file: File): Promise<boolean> {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to S3');
      }

      return true;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  },

  /**
   * Confirm that a file was successfully uploaded to S3
   * @param fileId The ID of the file to confirm
   * @returns The confirmed file information
   */
  async confirmFileUpload(fileId: string): Promise<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size_bytes: number;
    mime_type: string;
    description?: string;
    related_id: string;
    uploaded_by: string;
    uploaded_at: string;
    status: string;
  }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/files/confirm-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileId: fileId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.body?.message || 'Failed to confirm file upload');
      }

      const data = await response.json();
      const file = data.body?.file || data.file;
      
      if (!file) {
        throw new Error('Invalid response format');
      }
      
      return file;
    } catch (error) {
      console.error('Error confirming file upload:', error);
      throw error;
    }
  },
  
  /**
   * Get a list of files associated with the authenticated user
   * @returns Array of file metadata objects
   */
  async getFiles(): Promise<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size_bytes: number;
    mime_type: string;
    description?: string;
    related_id: string;
    uploaded_by: string;
    uploaded_at: string;
    status: string;
  }[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/files`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch files');
      }

      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },

  /**
   * Delete a file
   * @param fileId ID of the file to delete
   * @returns Success message
   */
  async deleteFile(fileId: string): Promise<string> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete file');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error);
      throw error;
    }
  },
  
  /**
   * Upload a file using the presigned URL approach
   * This is a convenience method that combines getPresignedUrl, uploadToS3, and confirmFileUpload
   * @param file The file to upload
   * @param type File type (thumbnail, content, assignment_submission, profile_image, course_resource)
   * @param relatedId ID of the related entity (course_id, assignment_id, etc.)
   * @param description Optional description of the file
   * @returns Uploaded file information including the URL
   */
  async uploadFile(
    file: File,
    type: "thumbnail" | "content" | "assignment_submission" | "profile_image" | "course_resource",
    relatedId: string,
    description?: string
  ): Promise<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size_bytes: number;
    mime_type: string;
    description?: string;
    related_id: string;
    uploaded_by: string;
    uploaded_at: string;
  }> {
    try {
      console.log(`uploadFile - Starting upload process for file: ${file.name}, type: ${type}, relatedId: ${relatedId}`);
      
      // 1. Get presigned URL
      const { presignedUrl, file: fileMetadata } = await this.getPresignedUrl(file, type, relatedId, description);
      console.log(`uploadFile - Got presigned URL and file metadata with ID: ${fileMetadata.id}`);
      
      // 2. Upload to S3 directly
      await this.uploadToS3(presignedUrl, file);
      console.log(`uploadFile - Successfully uploaded to S3 via presigned URL`);
      
      // 3. Confirm the upload
      const confirmedFile = await this.confirmFileUpload(fileMetadata.id);
      console.log(`uploadFile - Upload confirmed for file ID: ${confirmedFile.id}`);
      
      return confirmedFile;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  },
}; 