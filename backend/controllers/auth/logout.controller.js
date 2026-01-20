const { clearAuthCookies } = require("../../utils/jwt");
const { logAuthEvent } = require("../../utils/email");
const { prisma } = require("../../config/database");

/**
 * User Logout Controller
 * @route POST /auth/logout
 */
exports.logout = async (req, res) => {
  // Clear session token in DB if user is authenticated
  if (req.user?.id) {
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { sessionToken: null },
      });
    } catch (err) {
      console.error("Logout DB cleanup failed:", err.message);
    }
  }

  clearAuthCookies(res);
  logAuthEvent("logout", {
    ip:
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress,
    ok: true,
  });
  return res.json({ success: true });
};
