import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService } from '../services/apiService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "educator" ;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: "student" | "educator") => Promise<void>;
  updateRole: (role: "student" | "educator") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing auth token on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Validate token with the backend
          const userData = await apiService.validateToken(token);
          setUser(userData);
        } catch (error) {
          console.error("Error validating auth token:", error);
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await apiService.login(email, password);
      setUser(result.user);
      localStorage.setItem('authToken', result.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string, role: "student" | "educator") => {
    try {
      const result = await apiService.signup(email, password, name, role);
      setUser(result.user);
      localStorage.setItem('authToken', result.token);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const updateRole = (role: "student" | "educator") => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    updateRole,
  };

  // Show loading state or children
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}