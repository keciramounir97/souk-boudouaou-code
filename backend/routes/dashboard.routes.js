const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/user", auth, dashboardController.getUserDashboard);
router.get(
  "/admin",
  auth,
  requireRole("ADMIN", "super_admin"),
  dashboardController.getAdminDashboard
);
router.get(
  "/super",
  auth,
  requireRole("super_admin"),
  dashboardController.getSuperDashboard
);

module.exports = router;
