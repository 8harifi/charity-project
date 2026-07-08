import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "../Services/authService";

const AuthContext = createContext(null);

function decodeUserFromToken(access) {
  if (!access) return null;
  try {
    const decoded = jwtDecode(access);
    return {
      role: decoded.role,
      username: decoded.username,
      id: decoded.id,
      name: decoded.username,
    };
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [access, setAccess] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedAccess = localStorage.getItem("access");
    const savedRefresh = localStorage.getItem("refresh");

    if (savedAccess && savedRefresh) {
      setAccess(savedAccess);
      setRefresh(savedRefresh);
      setIsLogin(true);
    }
  }, []);

  const user = useMemo(() => decodeUserFromToken(access), [access]);

  const login = async (credentials) => {
    setError(null);

    try {
      const resp = await authService.login(credentials);
      const { access: newAccess, refresh: newRefresh } = resp.data;

      if (!newAccess || !newRefresh) {
        throw new Error("داده لاگین معتبر نیست");
      }

      localStorage.setItem("access", newAccess);
      localStorage.setItem("refresh", newRefresh);

      setAccess(newAccess);
      setRefresh(newRefresh);
      setIsLogin(true);

      return { success: true, access: newAccess, refresh: newRefresh };
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
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setAccess(null);
    setRefresh(null);
    setIsLogin(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{ access, refresh, isLogin, user, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
