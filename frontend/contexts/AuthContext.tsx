'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api } from '../lib/api';


interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (err) {
      console.error('Token verification failed:', err);
      Cookies.remove('auth_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      Cookies.set('auth_token', token, { expires: 7 });
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { user, token } = response.data;

      Cookies.set('auth_token', token, { expires: 7 });
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', data);
      setUser(response.data.user);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Profile update failed');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
