const { validationResult } = require("express-validator");
const { normalizeEmail, normalizeUsername } = require("../utils/helpers");

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
}

function sanitizeInput(req, res, next) {
  // Sanitize common input fields
  if (req.body.email) req.body.email = normalizeEmail(req.body.email);
  if (req.body.username)
    req.body.username = normalizeUsername(req.body.username);
  if (req.body.title) req.body.title = req.body.title.trim().substring(0, 200);
  if (req.body.details)
    req.body.details = req.body.details.trim().substring(0, 2000);
  if (req.body.description)
    req.body.description = req.body.description.trim().substring(0, 5000);

  next();
}

module.exports = {
  validateRequest,
  sanitizeInput,
};
