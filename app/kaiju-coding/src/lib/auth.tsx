import { createContext, useContext, useState, ReactNode } from 'react';
interface User {
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
  // const [user, setUser] = useState<User | null>({
  //   id: "2",
  //   email: "test@example.com",
  //   name: "Test User",
  //   role: "educator"  // or "educator" to test educator profile
  // });

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with your actual API call
      // This is a mock implementation
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('authToken', userData.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const signup = async (email: string, password: string, name: string, role: "student" | "educator") => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('authToken', userData.token);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 