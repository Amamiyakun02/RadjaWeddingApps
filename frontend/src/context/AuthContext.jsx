import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('radja_role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('radja_token');
      const savedRole = localStorage.getItem('radja_role');
      
      if (!token || !savedRole) {
        setLoading(false);
        return;
      }

      try {
        if (savedRole === 'customer') {
          const profile = await api.getMe();
          setUser(profile);
        } else if (savedRole === 'owner' || savedRole === 'staff') {
          const adminProfile = await api.getAdminMe();
          setAdmin(adminProfile);
        }
      } catch (err) {
        console.error('Session expired or invalid:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginCustomer = async (email, password) => {
    const res = await api.loginCustomer(email, password);
    localStorage.setItem('radja_token', res.access_token);
    localStorage.setItem('radja_role', 'customer');
    setUser(res.user);
    setRole('customer');
    return res;
  };

  const registerCustomer = async (userData) => {
    const res = await api.registerCustomer(userData);
    localStorage.setItem('radja_token', res.access_token);
    localStorage.setItem('radja_role', 'customer');
    setUser(res.user);
    setRole('customer');
    return res;
  };

  const loginGoogle = async (googleData) => {
    const res = await api.loginGoogle(googleData);
    localStorage.setItem('radja_token', res.access_token);
    localStorage.setItem('radja_role', 'customer');
    setUser(res.user);
    setRole('customer');
    return res;
  };

  const loginAdmin = async (email, password) => {
    const res = await api.loginAdmin(email, password);
    localStorage.setItem('radja_token', res.access_token);
    localStorage.setItem('radja_role', res.role);
    setAdmin(res.user);
    setRole(res.role);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('radja_token');
    localStorage.removeItem('radja_role');
    setUser(null);
    setAdmin(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (role === 'customer') {
      const profile = await api.getMe();
      setUser(profile);
    } else if (role === 'owner' || role === 'staff') {
      const adminProfile = await api.getAdminMe();
      setAdmin(adminProfile);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      admin,
      role,
      loading,
      loginCustomer,
      registerCustomer,
      loginGoogle,
      loginAdmin,
      logout,
      refreshProfile,
      isAuthenticated: !!(user || admin),
      isAdmin: role === 'owner' || role === 'staff',
      isOwner: role === 'owner'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
