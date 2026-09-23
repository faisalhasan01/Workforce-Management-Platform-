import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          if (res.data.user.activeOrganization && !localStorage.getItem('nexus_org_id')) {
            const orgId = res.data.user.activeOrganization._id || res.data.user.activeOrganization;
            localStorage.setItem('nexus_org_id', orgId);
          }
        }
      } catch (err) {
        console.error('Failed to authenticate session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('nexus_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.activeOrganization) {
        const orgId = res.data.user.activeOrganization._id || res.data.user.activeOrganization;
        localStorage.setItem('nexus_org_id', orgId);
      }
      return res.data;
    }
  };

  const register = async (name, email, password, orgName, jobTitle) => {
    const res = await api.post('/auth/register', { name, email, password, orgName, jobTitle });
    if (res.data.success) {
      localStorage.setItem('nexus_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.organization) {
        localStorage.setItem('nexus_org_id', res.data.organization._id);
      }
      return res.data;
    }
  };

  const demoLogin = async (role = 'Admin') => {
    const res = await api.post('/auth/demo-login', { role });
    if (res.data.success) {
      localStorage.setItem('nexus_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.activeOrganization) {
        const orgId = res.data.user.activeOrganization._id || res.data.user.activeOrganization;
        localStorage.setItem('nexus_org_id', orgId);
      }
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_org_id');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await api.put('/auth/profile', updates);
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
