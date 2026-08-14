import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const hasToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!hasToken) {
        setLoading(false);
        return;
      }
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (credentials, remember = false) => {
    const result = await authService.login(credentials, remember);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((data) => {
    setUser((prev) => (prev ? { ...prev, ...data } : data));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
