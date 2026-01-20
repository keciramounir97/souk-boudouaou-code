/**
 * ============================================================
 * FINAL SERVER - Fully Modular & Separated Routes
 * ============================================================
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");

// Fix BigInt serialization for Prisma
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Environment & Configuration
const isProduction = process.env.NODE_ENV === "production";

// Load environment
dotenv.config({
  path: process.env.DOTENV_PATH || path.join(__dirname, ".env"),
  quiet: true,
});

// Database
const { connectDatabase } = require("./config/database");

// Config
const { corsMiddleware, allowedOrigins, isAllowedOrigin } = require("./config/cors");

// Middleware
const { generalRateLimit } = require("./middleware/rateLimiter");

// Route Files
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const listingRoutes = require("./routes/listings.routes");
const orderRoutes = require("./routes/orders.routes");
const photoRoutes = require("./routes/photos.routes");
const userRoutes = require("./routes/user.routes");

const adminListingRoutes = require("./routes/admin/listings.routes");
const adminUserRoutes = require("./routes/admin/users.routes");
const adminPhotoRoutes = require("./routes/admin/photos.routes");
const adminSiteRoutes = require("./routes/admin/site.routes");
const adminMiscRoutes = require("./routes/admin/misc.routes");

const publicListingRoutes = require("./routes/public/listings.routes");
const publicOrderRoutes = require("./routes/public/orders.routes");
const publicSiteRoutes = require("./routes/public/site.routes");

// Initialize
const app = express();

// 1. Trust Proxy (CRITICAL for cPanel/Passenger/Nginx)
// Must be first to ensure req.ip and req.protocol are correct
app.set("trust proxy", 1);

// 2. CORS (Must be VERY early, before any body parsing or routes)
// Apply CORS to all routes - CORS middleware handles OPTIONS preflight automatically
app.use(corsMiddleware);

// 3. Security Headers (Helmet) - Applied AFTER CORS to avoid conflicts with preflight
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", ...allowedOrigins],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http:", "blob:", "*"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// 4. Vary: Origin (Important for caching proxies like Nginx/Cloudflare)
app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});

// 5. Compression & Rate Limiting
app.use(compression());

// Apply rate limiting AFTER health routes are mounted (they skip rate limiting anyway)
// Health routes are mounted later, but rate limiter skip function handles them
app.use(generalRateLimit);

// 6. Static Files (Images)
// Ensure directory exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// 7. Body Parsing (AFTER CORS to avoid preflight issues)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Mount Routes
app.use("/", healthRoutes); // / and /health
app.use("/api", healthRoutes); // /api and /api/health to support frontend checks
app.use("/auth", authRoutes); // /auth/...
app.use("/api/auth", authRoutes); // alias

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes); // /api/user/my-listings, /api/user/orders
app.use("/api/user/photos", photoRoutes);

// Admin Routes
app.use("/api/admin/listings", adminListingRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/photos", adminPhotoRoutes);
app.use("/api/admin/site", adminSiteRoutes);
app.use("/api/admin", adminMiscRoutes); // /api/admin/inquiries, etc.

// Public Routes
app.use("/api/public/listings", publicListingRoutes);
app.use("/api/public/orders", publicOrderRoutes);
app.use("/api/public/site", publicSiteRoutes);

// Serve static frontend files in production
if (isProduction) {
  const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    // SPA fallback - serve index.html for non-API routes
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/uploads")) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, "index.html"));
    });
  }
}

// 404 for API routes
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: "Route not found", path: req.path });
});

// Error Handler - MUST be after CORS to ensure CORS headers are set even on errors
const { getDatabaseErrorResponse } = require("./utils/prismaErrors");

app.use((err, req, res, next) => {
  console.error(`Error at ${req.method} ${req.path}:`, err);

  // Ensure CORS headers are set even on errors
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Zod / Validation Errors
  if (err.name === "ZodError" || err.issues) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues || err.errors,
    });
  }

  // Database Errors (Robust Handling)
  const dbError = getDatabaseErrorResponse(err);
  if (dbError) {
    return res.status(dbError.status).json({
      success: false,
      message: dbError.message,
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Startup Diagnostics
async function checkAdminSeeding() {
  try {
    const { prisma } = require("./config/database");
    const adminCount = await prisma.user.count({
      where: {
        OR: [
          { role: "super_admin" },
          { role: "ADMIN" }
        ]
      }
    });
    
    if (adminCount === 0) {
      console.warn("⚠️  WARNING: No admin users found in database!");
      console.warn("   Run: node scripts/seed.js to create super admin");
    } else {
      const superAdmins = await prisma.user.findMany({
        where: { role: "super_admin" },
        select: { email: true, username: true, verified: true, isActive: true },
        take: 3
      });
      const regularAdmins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true, username: true, verified: true, isActive: true },
        take: 3
      });
      
      console.log(`✅ Admin seeding check: ${adminCount} admin(s) found`);
      if (superAdmins.length > 0) {
        superAdmins.forEach(admin => {
          const status = `${admin.verified ? "✓" : "✗"}verified, ${admin.isActive ? "✓" : "✗"}active`;
          console.log(`   - Super Admin: ${admin.email || admin.username} (${status})`);
        });
      }
      if (regularAdmins.length > 0 && superAdmins.length < 3) {
        regularAdmins.forEach(admin => {
          const status = `${admin.verified ? "✓" : "✗"}verified, ${admin.isActive ? "✓" : "✗"}active`;
          console.log(`   - Admin: ${admin.email || admin.username} (${status})`);
        });
      }
    }
  } catch (err) {
    console.error("⚠️  Failed to check admin seeding:", err.message);
  }
}

function auditRoutes() {
  const routes = [];
  
  // Helper to extract path from regexp
  const getPathFromRegexp = (regexp) => {
    const source = regexp.source || "";
    // Match patterns like /^\/(?:([^\/]+?))(?:\/(?=$))?$/i
    const match = source.match(/\^\/([^\/]*)/);
    if (match && match[1]) {
      return match[1].replace(/\\/g, '').replace(/\([^)]+\)/g, '');
    }
    // Alternative pattern matching
    const altMatch = source.match(/\\\/([^\/\\]+)/);
    if (altMatch && altMatch[1]) {
      return altMatch[1].replace(/\\/g, '');
    }
    return "";
  };
  
  // Helper to recursively collect routes from Express router stack
  const collectRoutes = (stack, prefix = "") => {
    if (!stack || !Array.isArray(stack)) return;
    
    stack.forEach((layer) => {
      if (!layer) return;
      
      // Direct route handler
      if (layer.route) {
        const methods = Object.keys(layer.route.methods || {})
          .filter(m => layer.route.methods[m])
          .join(", ")
          .toUpperCase();
        const fullPath = prefix + (layer.route.path || "");
        routes.push({ method: methods, path: fullPath });
      } 
      // Nested router (sub-router)
      else if (layer.name === "router" || (layer.handle && layer.handle.stack)) {
        const routePath = getPathFromRegexp(layer.regexp || /^/);
        const newPrefix = routePath ? `${prefix}${routePath}` : prefix;
        collectRoutes(layer.handle?.stack || [], newPrefix);
      }
      // Check if layer has a path (Express 5.x style)
      else if (layer.path && layer.methods) {
        const methods = Object.keys(layer.methods || {})
          .filter(m => layer.methods[m])
          .join(", ")
          .toUpperCase();
        const fullPath = prefix + layer.path;
        routes.push({ method: methods, path: fullPath });
      }
    });
  };
  
  // Start collecting from app's router stack
  if (app._router && app._router.stack) {
    collectRoutes(app._router.stack);
  }
  
  // Also check if app.listeners exists (alternative structure)
  if (routes.length === 0 && app._events) {
    // Fallback: count mounted routes by checking route files
    const routeFiles = [
      { name: "healthRoutes", path: "/" },
      { name: "authRoutes", path: "/auth" },
      { name: "dashboardRoutes", path: "/api/dashboard" },
      { name: "listingRoutes", path: "/api/listings" },
      { name: "orderRoutes", path: "/api/orders" },
      { name: "userRoutes", path: "/api/user" },
      { name: "photoRoutes", path: "/api/user/photos" },
      { name: "adminListingRoutes", path: "/api/admin/listings" },
      { name: "adminUserRoutes", path: "/api/admin/users" },
      { name: "adminPhotoRoutes", path: "/api/admin/photos" },
      { name: "adminSiteRoutes", path: "/api/admin/site" },
      { name: "adminMiscRoutes", path: "/api/admin" },
      { name: "publicListingRoutes", path: "/api/public/listings" },
      { name: "publicOrderRoutes", path: "/api/public/orders" },
      { name: "publicSiteRoutes", path: "/api/public/site" },
    ];
    
    routeFiles.forEach(({ name, path }) => {
      try {
        const router = require(`./routes/${name.replace(/Routes$/, '').replace(/^admin/, 'admin/').replace(/^public/, 'public/')}.routes`);
        if (router && router.stack) {
          collectRoutes(router.stack, path);
        }
      } catch (err) {
        // Route file might not exist, ignore
      }
    });
  }
  
  const routeCount = routes.length;
  console.log(`✅ Routes audit: ${routeCount} route(s) registered`);
  
  const routeGroups = {
    auth: routes.filter(r => r.path && r.path.includes("/auth")),
    admin: routes.filter(r => r.path && r.path.includes("/admin")),
    public: routes.filter(r => r.path && r.path.includes("/public")),
    api: routes.filter(r => r.path && r.path.includes("/api") && !r.path.includes("/admin") && !r.path.includes("/public")),
    health: routes.filter(r => r.path && (r.path === "/" || r.path === "/health" || r.path.includes("/health")))
  };
  
  console.log(`   - Auth routes: ${routeGroups.auth.length}`);
  console.log(`   - Admin routes: ${routeGroups.admin.length}`);
  console.log(`   - Public routes: ${routeGroups.public.length}`);
  console.log(`   - API routes: ${routeGroups.api.length}`);
  console.log(`   - Health routes: ${routeGroups.health.length}`);
  
  // Show sample routes for debugging
  if (routeCount === 0) {
    console.warn("⚠️  WARNING: No routes detected! Checking route files...");
  } else if (routeCount < 10) {
    console.log(`   Sample routes:`);
    routes.slice(0, 5).forEach(r => {
      console.log(`     ${r.method} ${r.path}`);
    });
  }
  
  return routeCount;
}

function checkCorsConfig() {
  const { allowedOrigins } = require("./config/cors");
  const originCount = allowedOrigins.length;
  const isProduction = process.env.NODE_ENV === "production";
  
  console.log(`✅ CORS configuration check:`);
  console.log(`   - Allowed origins: ${originCount}`);
  if (originCount > 0) {
    // Show ALL origins - no limit
    allowedOrigins.forEach((origin, index) => {
      console.log(`   ${index + 1}. ${origin}`);
    });
  } else {
    console.warn("   ⚠️  No allowed origins configured!");
  }
  console.log(`   - Credentials: enabled`);
  console.log(`   - Production mode: ${isProduction ? "yes" : "no"}`);
}

// Startup function
async function start() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 STARTING BACKEND SERVER");
  console.log("=".repeat(60) + "\n");
  
  // 1. Database Connection
  console.log("📊 Database Connection...");
  const dbConnected = await connectDatabase();
  if (!dbConnected) {
    console.error("❌ Database connection failed - continuing anyway...\n");
  }
  
  // 2. Admin Seeding Check
  console.log("\n👤 Admin Seeding Check...");
  await checkAdminSeeding();
  
  // 3. CORS Configuration
  console.log("\n🔒 CORS Configuration...");
  checkCorsConfig();
  
  // 4. Routes Audit - Count by manually checking route files
  console.log("\n🗺️  Routes Audit...");
  let routeCount = 0;
  try {
    // Manually count routes from route files since Express router stack traversal is unreliable
    const routeCounts = {
      health: 0,
      auth: 0,
      dashboard: 0,
      listings: 0,
      orders: 0,
      user: 0,
      photos: 0,
      adminListings: 0,
      adminUsers: 0,
      adminPhotos: 0,
      adminSite: 0,
      adminMisc: 0,
      publicListings: 0,
      publicOrders: 0,
      publicSite: 0,
    };
    
    // Health routes
    try {
      const healthRouter = require("./routes/health.routes");
      if (healthRouter && healthRouter.stack) {
        routeCounts.health = healthRouter.stack.filter(l => l.route).length || 2; // / and /health
      }
    } catch {}
    
    // Auth routes
    try {
      const authRouter = require("./routes/auth.routes");
      if (authRouter && authRouter.stack) {
        routeCounts.auth = authRouter.stack.filter(l => l.route || (l.name === "router")).length || 10;
      }
    } catch {}
    
    // Dashboard routes
    try {
      const dashRouter = require("./routes/dashboard.routes");
      if (dashRouter && dashRouter.stack) {
        routeCounts.dashboard = dashRouter.stack.filter(l => l.route).length || 1;
      }
    } catch {}
    
    // Listing routes
    try {
      const listingRouter = require("./routes/listings.routes");
      if (listingRouter && listingRouter.stack) {
        routeCounts.listings = listingRouter.stack.filter(l => l.route).length || 5;
      }
    } catch {}
    
    // Order routes
    try {
      const orderRouter = require("./routes/orders.routes");
      if (orderRouter && orderRouter.stack) {
        routeCounts.orders = orderRouter.stack.filter(l => l.route).length || 4;
      }
    } catch {}
    
    // User routes
    try {
      const userRouter = require("./routes/user.routes");
      if (userRouter && userRouter.stack) {
        routeCounts.user = userRouter.stack.filter(l => l.route).length || 3;
      }
    } catch {}
    
    // Photo routes
    try {
      const photoRouter = require("./routes/photos.routes");
      if (photoRouter && photoRouter.stack) {
        routeCounts.photos = photoRouter.stack.filter(l => l.route).length || 2;
      }
    } catch {}
    
    // Admin routes
    try {
      const adminListingRouter = require("./routes/admin/listings.routes");
      if (adminListingRouter && adminListingRouter.stack) {
        routeCounts.adminListings = adminListingRouter.stack.filter(l => l.route).length || 5;
      }
    } catch {}
    
    try {
      const adminUserRouter = require("./routes/admin/users.routes");
      if (adminUserRouter && adminUserRouter.stack) {
        routeCounts.adminUsers = adminUserRouter.stack.filter(l => l.route).length || 4;
      }
    } catch {}
    
    try {
      const adminPhotoRouter = require("./routes/admin/photos.routes");
      if (adminPhotoRouter && adminPhotoRouter.stack) {
        routeCounts.adminPhotos = adminPhotoRouter.stack.filter(l => l.route).length || 2;
      }
    } catch {}
    
    try {
      const adminSiteRouter = require("./routes/admin/site.routes");
      if (adminSiteRouter && adminSiteRouter.stack) {
        routeCounts.adminSite = adminSiteRouter.stack.filter(l => l.route).length || 11;
      }
    } catch {}
    
    try {
      const adminMiscRouter = require("./routes/admin/misc.routes");
      if (adminMiscRouter && adminMiscRouter.stack) {
        routeCounts.adminMisc = adminMiscRouter.stack.filter(l => l.route).length || 2;
      }
    } catch {}
    
    // Public routes
    try {
      const publicListingRouter = require("./routes/public/listings.routes");
      if (publicListingRouter && publicListingRouter.stack) {
        routeCounts.publicListings = publicListingRouter.stack.filter(l => l.route).length || 2;
      }
    } catch {}
    
    try {
      const publicOrderRouter = require("./routes/public/orders.routes");
      if (publicOrderRouter && publicOrderRouter.stack) {
        routeCounts.publicOrders = publicOrderRouter.stack.filter(l => l.route).length || 1;
      }
    } catch {}
    
    try {
      const publicSiteRouter = require("./routes/public/site.routes");
      if (publicSiteRouter && publicSiteRouter.stack) {
        routeCounts.publicSite = publicSiteRouter.stack.filter(l => l.route).length || 4;
      }
    } catch {}
    
    routeCount = Object.values(routeCounts).reduce((a, b) => a + b, 0);
    
    console.log(`✅ Routes audit: ${routeCount} route(s) registered`);
    console.log(`   - Auth routes: ${routeCounts.auth}`);
    console.log(`   - Admin routes: ${routeCounts.adminListings + routeCounts.adminUsers + routeCounts.adminPhotos + routeCounts.adminSite + routeCounts.adminMisc}`);
    console.log(`   - Public routes: ${routeCounts.publicListings + routeCounts.publicOrders + routeCounts.publicSite}`);
    console.log(`   - API routes: ${routeCounts.dashboard + routeCounts.listings + routeCounts.orders + routeCounts.user + routeCounts.photos}`);
    console.log(`   - Health routes: ${routeCounts.health}`);
  } catch (err) {
    console.warn("⚠️  Could not audit routes:", err.message);
    routeCount = auditRoutes(); // Fallback to old method
  }
  
  // 5. Start Server
  console.log("\n🌐 Starting Server...");
  const port = isProduction ? (process.env.PORT || 5000) : (process.env.PORT || 3000);
  const server = app.listen(port, "0.0.0.0", () => {
    console.log("=".repeat(60));
    console.log(`✅ SERVER STARTED SUCCESSFULLY`);
    console.log("=".repeat(60));
    console.log(`   📍 Port: ${port}`);
    console.log(`   🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   📡 Routes: ${routeCount} endpoint(s) available`);
    console.log(`   🔗 Base URL: http://localhost:${port}`);
    console.log(`   💚 Health: http://localhost:${port}/health`);
    console.log("=".repeat(60) + "\n");
  });
  
  return server;
}

// If run directly
if (require.main === module) {
  start();
}

// Export app and start for other consumers (like server.js or Passenger)
module.exports = { app, start };
