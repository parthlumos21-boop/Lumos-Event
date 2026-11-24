import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('lumos_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('lumos_access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('lumos_refresh_token'));
  const [loading, setLoading] = useState(true);

  // Listen for broadcast logout events
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };
    window.addEventListener('lumos_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('lumos_auth_logout', handleLogoutEvent);
  }, []);

  // Verify session on mount without logging out on temporary network failures
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lumos_access_token');
      const storedRefreshToken = localStorage.getItem('lumos_refresh_token');

      if (storedToken && storedRefreshToken) {
        try {
          const res = await axiosClient.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('lumos_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Initial session check note:', err?.message || err);
          if (err.response?.status === 401 || err.response?.status === 404) {
            localStorage.removeItem('lumos_user');
            localStorage.removeItem('lumos_access_token');
            localStorage.removeItem('lumos_refresh_token');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const { user: userData, accessToken: newAccess, refreshToken: newRefresh } = res.data;

    setUser(userData);
    setAccessToken(newAccess);
    setRefreshToken(newRefresh);

    localStorage.setItem('lumos_user', JSON.stringify(userData));
    localStorage.setItem('lumos_access_token', newAccess);
    localStorage.setItem('lumos_refresh_token', newRefresh);

    return userData;
  };

  const logout = useCallback(async () => {
    try {
      const curRefresh = localStorage.getItem('lumos_refresh_token');
      if (curRefresh) {
        await axiosClient.post('/auth/logout', { refreshToken: curRefresh });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('lumos_user');
      localStorage.removeItem('lumos_access_token');
      localStorage.removeItem('lumos_refresh_token');
    }
  }, []);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user && !!accessToken,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
