// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../Services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [access, setAccess] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState(null);

  // Load saved login
  useEffect(() => {
    const savedAccess= localStorage.getItem('access');
    const savedRefresh = localStorage.getItem('refresh');

    if (savedAccess && savedRefresh) {
      setAccess(savedAccess);
      setRefresh(savedRefresh);
      setIsLogin(true);
    }
  }, []);

  // Login (Universal for all roles)
  const login = async (credentials) => {
    setError(null);

    try {
      // Make sure returned format = { user, token }
      const resp = await authService.login(credentials);
      const { access, refresh } = resp.data;

      if (!access || !refresh) {
        throw new Error("داده لاگین معتبر نیست");
      }

      // Save
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      setAccess(access);
      setRefresh(refresh);
      setIsLogin(true);

      return { success: true, access, refresh };
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      const apiMsg =
        err?.response?.data?.detail ||
        (Array.isArray(err?.response?.data?.non_field_errors)
          ? err.response.data.non_field_errors[0]
          : null) ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      const message = apiMsg || err.message || "خطای ورود";
      setError(message);
      setIsLogin(false);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

    setAccess(null);
    setRefresh(null);
    setIsLogin(false);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ access, refresh, isLogin, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
