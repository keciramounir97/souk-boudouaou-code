// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuth();
  const location = useLocation();
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const isAuth = !!user || !!storedUser || !!token || !!storedToken;

  // For admin routes, check if user has admin role
  const isAdminRoute = location.pathname.startsWith("/admin");
  const userRole = user?.role || (storedUser ? JSON.parse(storedUser)?.role : null);
  const isAdmin = userRole === "ADMIN" || userRole === "super_admin";

  useEffect(() => {
    // Refresh user data if we have a token but no user object
    if ((token || storedToken) && !user && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed) {
          // User data will be loaded by AuthContext useEffect
        }
      } catch {
        // ignore
      }
    }
  }, [token, storedToken, user, storedUser]);

  if (!isAuth) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // For admin routes, ensure user is admin
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
