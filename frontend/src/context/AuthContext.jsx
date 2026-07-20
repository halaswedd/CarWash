import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on page load/refresh[cite: 5]
  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me.php'); //[cite: 5]
      if (res.data.success) {
        setAdmin(res.data.admin);
      } else {
        setAdmin(null);
      }
    } catch (err) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login.php', { email, password }); //[cite: 3]
    if (res.data.success) {
      setAdmin(res.data.admin);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout.php'); //[cite: 4]
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);