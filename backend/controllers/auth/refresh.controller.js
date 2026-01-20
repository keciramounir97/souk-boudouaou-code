const jwt = require("jsonwebtoken");
const { prisma } = require("../../config/database");
const {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  parseCookies,
  JWT_REFRESH_SECRET,
} = require("../../utils/jwt");
const { logAuthEvent } = require("../../utils/email");

/**
 * Refresh Token Controller
 * @route POST /auth/refresh
 */
exports.refresh = async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const rt =
      cookies.refresh_token ||
      req.body?.refreshToken ||
      req.body?.refresh_token ||
      req.headers["x-refresh-token"];

    if (!rt || !JWT_REFRESH_SECRET) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(rt, JWT_REFRESH_SECRET);
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    if (decoded?.tokenType !== "refresh") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, { accessToken, refreshToken });

    logAuthEvent("refresh", {
      userId: user.id,
      ip:
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress,
      ok: true,
    });

    const response = { success: true, token: accessToken };
    if (refreshToken) response.refreshToken = refreshToken;
    return res.json(response);
  } catch (err) {
    console.error("Refresh error:", err);
    logAuthEvent("refresh", { ok: false, reason: "server_error" });
    return res.status(500).json({ success: false, message: "Refresh failed" });
  }
};
