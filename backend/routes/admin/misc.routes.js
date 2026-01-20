const express = require("express");
const { auth, requireRole } = require("../../middleware/auth");
const inquiriesController = require("../../controllers/admin/inquiries/getAll.controller");
const clicksController = require("../../controllers/admin/audit/clicks.controller");

const router = express.Router();
router.use(auth, requireRole("super_admin"));

router.get("/inquiries", inquiriesController.getAllInquiries);
router.get("/audit/clicks", clicksController.getClicks);

module.exports = router;
