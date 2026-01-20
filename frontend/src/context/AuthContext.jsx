/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const saveSession = (userData, jwt, refreshToken) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwt);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  // ===========================
  // AUTH FLOWS (EMAIL/USERNAME)
  // ===========================
  const signup = async ({ username, email, password, fullName, wilaya }) => {
    try {
      const res = await api.post("/auth/signup", {
        username,
        email,
        password,
        fullName,
        wilaya,
      });

      const { user: userData, token: jwt, refreshToken } = res.data;
      saveSession(userData, jwt, refreshToken);

      return { success: true, user: userData };
    } catch (err) {
      console.error("signup error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Signup failed. Try again.";
      return { success: false, message: msg };
    }
  };

  const login = async ({ identifier, password }) => {
    try {
      const res = await api.post("/auth/login", { identifier, password });
      const { user: userData, token: jwt, refreshToken } = res.data;

      saveSession(userData, jwt, refreshToken);
      return { success: true, user: userData };
    } catch (err) {
      // Only log non-400 errors (400 means invalid credentials, which is expected)
      if (err?.response?.status !== 400) {
        console.error("login error:", err);
      }
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Check your credentials.";
      return { success: false, message: msg };
    }
  };

  const requestEmailVerification = async (email) => {
    try {
      const res = await api.post("/auth/verify-email/request", { email });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "Email sent.",
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send verification email.";
      return { success: false, message: msg };
    }
  };

  const confirmEmailVerification = async ({ email, token }) => {
    try {
      const res = await api.post("/auth/verify-email/confirm", { email, token });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "Email verified.",
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Verification failed.";
      return { success: false, message: msg };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "If an account exists, OTP was sent.",
      };
    } catch (err) {
      console.error("forgotPassword error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send OTP. Try again.";
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "OTP verified.",
      };
    } catch (err) {
      console.error("verifyOtp error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "OTP verification failed.";
      return { success: false, message: msg };
    }
  };

  const resetPassword = async ({ email, otp, password }) => {
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
      });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "Password updated.",
      };
    } catch (err) {
      console.error("resetPassword error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Reset failed. Try again.";
      return { success: false, message: msg };
    }
  };

  const updateUser = (newData) => {
    setUser(newData);
    localStorage.setItem("user", JSON.stringify(newData));
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      void err;
    }
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        requestEmailVerification,
        confirmEmailVerification,
        forgotPassword,
        verifyOtp,
        resetPassword,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
