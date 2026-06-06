import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user profile on load
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      if (response.data && response.data.data) {
        const userData = response.data.data.user || response.data.data;
        if (userData && userData.email) {
          setUser(userData);
          return userData;
        }
      }
      setUser(null);
    } catch (err) {
      setUser(null);
      // We don't throw an error here, as the user might just not be logged in yet.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      await api.post('/login', { email, password });
      
      // Fetch full profile immediately to load enrolledCourses and all user metadata
      const profileData = await fetchProfile();
      return profileData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      setLoading(true);
      // Use multipart/form-data for file upload
      const response = await api.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    try {
      setError(null);
      setLoading(true);
      await api.patch('/users/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Fetch full profile to ensure all updated metadata and enrolledCourses are fetched
      const profileData = await fetchProfile();
      return profileData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
