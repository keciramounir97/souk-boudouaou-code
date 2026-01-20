const jwt = require("jsonwebtoken");
const { parseCookies } = require("../utils/jwt");
const { prisma } = require("../config/database");

async function auth(req, res, next) {
  if (req.method === "OPTIONS") return next(); // Allow preflight

  const headerToken = req.headers.authorization?.split(" ")[1];
  const cookieToken = parseCookies(req.headers.cookie || "").access_token;
  const token = headerToken || cookieToken;
  if (!token)
    return res.status(401).json({ success: false, message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check session in DB (Better security, like old backend)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, sessionToken: true, isActive: true },
    });

    if (!user || user.sessionToken !== decoded.sid) {
      return res
        .status(401)
        .json({ success: false, message: "Session expired or invalid" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account disabled" });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}

async function optionalAuth(req, _res, next) {
  const headerToken = req.headers.authorization?.split(" ")[1];
  const cookieToken = parseCookies(req.headers.cookie || "").access_token;
  const token = headerToken || cookieToken;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, sessionToken: true, isActive: true },
    });

    if (user && user.sessionToken === decoded.sid && user.isActive) {
      req.user = { id: user.id, role: user.role };
    }
  } catch {
    req.user = undefined;
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (req.method === "OPTIONS") return next();
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

module.exports = { auth, optionalAuth, requireRole };
