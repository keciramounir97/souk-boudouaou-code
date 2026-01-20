const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, sid: user.sessionToken },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  if (!JWT_REFRESH_SECRET) return null;
  return jwt.sign(
    { userId: user.id, tokenType: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

function parseCookies(header) {
  const list = {};
  if (!header) return list;
  header.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts.shift()?.trim();
    if (!key) return;
    const value = decodeURIComponent(parts.join("=")?.trim() || "");
    list[key] = value;
  });
  return list;
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  const isProd =
    String(process.env.NODE_ENV || "").toLowerCase() === "production";
  const sameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  const domain = process.env.COOKIE_DOMAIN || undefined;
  const secure =
    String(
      process.env.COOKIE_SECURE || (isProd ? "true" : "false")
    ).toLowerCase() === "true";
  const maxAgeAccess = Number(
    process.env.COOKIE_ACCESS_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000
  );
  const maxAgeRefresh = Number(
    process.env.COOKIE_REFRESH_MAX_AGE_MS || 30 * 24 * 60 * 60 * 1000
  );

  if (accessToken) {
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: maxAgeAccess,
      domain,
      path: "/",
    });
  }
  if (refreshToken) {
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: maxAgeRefresh,
      domain,
      path: "/",
    });
  }
}

function clearAuthCookies(res) {
  const domain = process.env.COOKIE_DOMAIN || undefined;
  const sameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  const secure =
    String(
      process.env.COOKIE_SECURE ||
        (String(process.env.NODE_ENV).toLowerCase() === "production"
          ? "true"
          : "false")
    ).toLowerCase() === "true";
  res.cookie("access_token", "", {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 0,
    domain,
    path: "/",
  });
  res.cookie("refresh_token", "", {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 0,
    domain,
    path: "/",
  });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  parseCookies,
  setAuthCookies,
  clearAuthCookies,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
};
