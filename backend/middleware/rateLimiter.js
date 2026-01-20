const rateLimitMiddleware = require("express-rate-limit");

// General rate limiting
const generalRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for OPTIONS preflight
    if (req.method === "OPTIONS") return true;
    // Skip rate limiting for health check endpoints
    if (req.path === "/" || req.path === "/health" || req.path === "/api/health") return true;
    return false;
  },
});

// Auth-specific rate limiting (stricter)
const authRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => req.method === "OPTIONS",
});

// Simple in-memory rate limiter for auth endpoints
const rateBuckets = new Map();

function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + windowMs;
  }
  bucket.count++;
  rateBuckets.set(key, bucket);
  return bucket.count <= limit;
}

function authRateLimiter(req, res, next) {
  if (req.method === "OPTIONS") return next(); // Skip OPTIONS for CORS

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const key = `${ip}:${req.path}`;
  const ok = rateLimit(
    key,
    Number(process.env.AUTH_RATE_LIMIT || 10),
    Number(process.env.AUTH_RATE_WINDOW_MS || 60_000)
  );
  if (!ok) {
    return res
      .status(429)
      .json({ success: false, message: "Too many requests" });
  }
  next();
}

module.exports = {
  generalRateLimit,
  authRateLimit,
  authRateLimiter,
};
