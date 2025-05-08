import { Course } from '@/types/course';
import { User } from '../lib/auth';

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
   * Get list of all courses
   * @returns List of courses
   */
  async getCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      return data.courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
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
   * Register a new user
   * @param email User's email
   * @param password User's password
   * @param name User's name
   * @param role User's role
   * @returns User data with token
   */
  async signup(email: string, password: string, name: string, role: "student" | "educator"): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: email, 
          email, 
          password, 
          name, 
          role 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
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
      console.error('Signup error:', error);
      throw error;
    }
  },

  /**
   * Validate the current auth token and get user data
   * @returns User data if token is valid
   */
  async validateToken(token: string): Promise<User> {
    try {
      // First, try to validate with the backend
      try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Map backend user data to our frontend User type
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role === 'educator' ? 'educator' : 'student',
          };
        }
      } catch (error) {
        console.warn('Backend token validation failed, using fallback validation:', error);
      }

      // Fallback validation if the endpoint doesn't exist or returns an error
      // This is a simplified validation that doesn't check token expiration
      try {
        const decoded = atob(token);
        const [userId, timestamp] = decoded.split(':');
        
        // Check if the token is reasonably recent (within 30 days)
        const tokenDate = new Date(parseInt(timestamp));
        const now = new Date();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        
        if (now.getTime() - tokenDate.getTime() > thirtyDaysMs) {
          throw new Error('Token expired');
        }
        
        // For simplicity, we'll use a default user
        // In a real app, you would look up the user by ID
        return {
          id: userId,
          email: 'user@example.com',
          name: 'Authenticated User',
          role: 'student',
        };
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        throw new Error('Invalid token format');
      }
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
  }
}; 