const express = require("express");
const healthController = require("../controllers/health.controller");

const router = express.Router();

// Root endpoint
router.get("/", healthController.getRoot);

// Health check endpoint
router.get("/health", healthController.getHealth);

module.exports = router;
