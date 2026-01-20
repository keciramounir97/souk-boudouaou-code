// src/api/api.js
import axios from "axios";
import { ensureApiBaseUrl, normalizeEndpointPath } from "./apiBase";

// Get API URL from environment variable
// VITE_API_URL should be set in .env file (e.g., VITE_API_URL=https://server.soukboudouaou.com)
// If not set in dev mode, use Vite proxy (empty string = relative URLs)
// If not set in production, throw error to prevent hardcoded URLs
const rawBase = import.meta.env.VITE_API_URL;

if (!rawBase && !import.meta.env.DEV) {
  console.error(
    "❌ VITE_API_URL is not set! Please set VITE_API_URL in your .env file.\n" +
    "Example: VITE_API_URL=https://server.soukboudouaou.com"
  );
  throw new Error(
    "VITE_API_URL environment variable is required. Please set it in your .env file."
  );
}

const baseURL = ensureApiBaseUrl(rawBase || "");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: api.defaults.baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof config.url === "string") {
    config.url = normalizeEndpointPath(config.url, {
      throwOnApiPrefix: import.meta.env.DEV,
    });
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  const res = await refreshClient.post(
    "/auth/refresh",
    refreshToken ? { refreshToken } : undefined
  );
  const token = res.data?.token;
  if (token) localStorage.setItem("token", token);
  if (res.data?.refreshToken) {
    localStorage.setItem("refreshToken", res.data.refreshToken);
  }
  return token;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const original = error.config;
    const url = String(original?.url || "");
    
    // Don't log network errors or CORS errors - they're handled gracefully
    const isNetworkError = !error.response || error.code === "ERR_NETWORK" || error.code === "ERR_CONNECTION_RESET";
    const isCorsError = error.message?.includes("CORS") || error.message?.includes("Access-Control");
    
    // Suppress console errors for expected 404s (site settings endpoints)
    const isSiteSettings404 = 
      status === 404 && 
      (url.includes("/site/moving-header") || 
       url.includes("/site/hero-slides") || 
       url.includes("/site/cta") || 
       url.includes("/site/footer") ||
       url.includes("/site/logo"));
    
    // Suppress console errors for expected 400s (login with invalid credentials)
    const isLogin400 = 
      status === 400 && 
      url.includes("/auth/login");
    
    // Only log unexpected errors in development
    if (!isNetworkError && !isCorsError && !isSiteSettings404 && !isLogin400 && import.meta.env.DEV) {
      console.error("API Error:", error.message);
    }
    
    if (
      status === 401 &&
      !original?._retry &&
      !String(original?.url || "").includes("/auth/refresh")
    ) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject, original });
        });
      }
      isRefreshing = true;
      try {
        await refreshAccessToken();
        isRefreshing = false;
        const queued = pendingRequests.splice(0, pendingRequests.length);
        queued.forEach(({ resolve, original }) => {
          resolve(api(original));
        });
        return api(original);
      } catch (e) {
        isRefreshing = false;
        const queued = pendingRequests.splice(0, pendingRequests.length);
        queued.forEach(({ reject }) => reject(e));
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
