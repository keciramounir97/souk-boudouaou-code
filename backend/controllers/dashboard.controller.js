const { prisma } = require("../config/database");
const { sanitizeUser } = require("../utils/helpers");

/**
 * Get User Dashboard
 * @route GET /api/dashboard/user
 */
exports.getUserDashboard = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error("Dashboard user error:", err);
    return res.status(500).json({ success: false, message: "Request failed" });
  }
};

/**
 * Get Admin Dashboard
 * @route GET /api/dashboard/admin
 */
exports.getAdminDashboard = (req, res) => {
  res.json({ success: true, message: "Admin Dashboard", user: req.user });
};

/**
 * Get Super Admin Dashboard
 * @route GET /api/dashboard/super
 */
exports.getSuperDashboard = (req, res) => {
  res.json({
    success: true,
    message: "Super Admin Dashboard",
    user: req.user,
  });
};
