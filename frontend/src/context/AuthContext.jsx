import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecom_token') || null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setUser(data.user);
        } else {
          // Token invalid or expired
          localStorage.removeItem('ecom_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const loginUser = (userData, authToken) => {
    localStorage.setItem('ecom_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('ecom_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
