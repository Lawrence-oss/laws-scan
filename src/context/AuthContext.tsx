import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configure axios interceptors for automatic token attachment
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh and logout on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const newToken = response.data.access;
          localStorage.setItem('auth_token', newToken);
          
          // Retry the original request with new token
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.setItem('user_logged_out', 'true'); // Mark as intentional logout
          window.location.href = '/';
        }
      } else {
        // No refresh token, logout user
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.setItem('user_logged_out', 'true'); // Mark as intentional logout
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user was intentionally logged out
      const wasLoggedOut = localStorage.getItem('user_logged_out');
      if (wasLoggedOut) {
        localStorage.removeItem('user_logged_out');
        setIsLoading(false);
        return;
      }

      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          // Verify token is still valid by fetching user profile
          const response = await axios.get(`${API_BASE_URL}/api/user/profile/`);
          setUser(response.data);
          setToken(storedToken);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
        email,
        password,
      });

      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('auth_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.removeItem('user_logged_out'); // Clear logout flag
      setToken(access);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] ||
                          'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register/`, {
        username,
        email,
        password,
      });

      // Registration successful - user needs to login
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }

      return { success: false, error: errorMessage };
    }
  };

  // Logout function - now properly clears state and redirects
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.setItem('user_logged_out', 'true'); // Mark as intentional logout
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
  
    axios.post(`${API_BASE_URL}/api/auth/logout/`).catch(() => {
    });

    // Redirect to landing page after logout
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      user, 
      login, 
      register, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};