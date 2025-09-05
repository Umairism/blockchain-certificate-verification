import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  signup: (username: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    try {
      // Call real backend API for authentication
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.error === false && data.data) {
        // Store the JWT token
        localStorage.setItem('token', data.data.access_token);
        
        // Create user object from backend response
        const user: User = {
          id: data.data.user.user_id.toString(),
          email: username, // Use username as email for compatibility
          role: data.data.user.role.toLowerCase() as 'admin' | 'user',
          name: data.data.user.username
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          role: role === 'admin' ? 'Admin' : 'User'
        })
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};