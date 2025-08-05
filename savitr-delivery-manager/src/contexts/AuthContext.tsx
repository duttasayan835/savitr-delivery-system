"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { UserRole } from '@/models/User';

// Configure axios defaults
axios.defaults.baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Define the User type
interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  address?: string;
}

// Interface for signup data
interface SignupData {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: UserRole;
  address: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRecipient: boolean;
  login: (identifier: string, password: string, role: UserRole) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser === 'object') {
              setUser(parsedUser);
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
              throw new Error('Invalid user data');
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          // Clear invalid data
          if (storedUser === 'undefined' || storedUser === 'null') {
            localStorage.removeItem('user');
          }
          if (!token) {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string, role: UserRole) => {
    try {
      console.log('Attempting login with:', { identifier, role });
      let response;
      if (role === UserRole.ADMIN) {
        response = await axios.post('/api/auth/admin-login', {
          email: identifier,
          password
        });
      } else {
        response = await axios.post('/api/auth/login', {
          email: identifier,
          password
        });
      }
      console.log('Login response:', response.data);
      
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      // Redirect admin to dashboard
      if (user && user.role === UserRole.ADMIN) {
        window.location.href = '/admin/dashboard';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      } else if (error.message === 'Network Error') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      } else {
        throw new Error('Login failed. Please try again later.');
      }
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      console.log('Verifying OTP for phone:', phone);
      const response = await axios.post('/api/auth/otp/verify', { 
        phone,
        otp
      });
      console.log('OTP verification response:', response.data);
      
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message === 'Network Error') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      } else {
        throw new Error('OTP verification failed. Please try again later.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === UserRole.ADMIN,
    isRecipient: user?.role === UserRole.RECIPIENT,
    login,
    verifyOtp,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
