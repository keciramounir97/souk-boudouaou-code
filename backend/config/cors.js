const cors = require("cors");

/**
 * ============================================================
 * CORS CONFIGURATION (PRODUCTION READY)
 * ============================================================
 */

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173", // Vite Dev
  "http://localhost:4173", // Vite Preview
  "http://localhost:5000", // Backend Local
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
  "https://souk-boudouaou.vercel.app", // Vercel Frontend
  "https://soukboudouaou.com",
  "https://www.soukboudouaou.com",
  "https://server.soukboudouaou.com",
  "https://5550e58c-d211-4ebe-9a5a-5799c7b3f74f-00-3r0pxbo27gedi.picard.replit.dev",
];

// Load from environment or use defaults
const RAW_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : DEFAULT_ALLOWED_ORIGINS;

/**
 * Normalizes origins by:
 * 1. Stripping quotes (common in .env files)
 * 2. Trimming whitespace
 * 3. Removing trailing slashes
 */
const normalizeOrigin = (origin) => {
  if (!origin) return "";
  return String(origin)
    .trim()
    .replace(/^["']|["']$/g, "") // Remove wrapping quotes
    .replace(/\/+$/, ""); // Remove trailing slashes
};

const allowedOrigins = RAW_ORIGINS.map(normalizeOrigin).filter(Boolean);

/**
 * Validation logic for incoming Origin header
 */
const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (mobile apps, Postman, server-to-server)
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  return allowedOrigins.includes(normalized);
};

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: ["*"],
  exposedHeaders: ["*"],
  optionsSuccessStatus: 204,
  maxAge: 86400,
  preflightContinue: false,
};

const corsMiddleware = cors(corsOptions);

module.exports = {
  corsMiddleware,
  corsOptions,
  allowedOrigins,
  isAllowedOrigin,
};
