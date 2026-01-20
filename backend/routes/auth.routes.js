const express = require("express");
const { auth } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/rateLimiter");
const { validateRequest, sanitizeInput } = require("../middleware/validation");
const { body } = require("express-validator");
const {
  normalizeEmail,
  isDeliverableEmailFormat,
  isDisposableEmail,
} = require("../utils/helpers");

// Import Separated Controllers
const signupController = require("../controllers/auth/signup.controller");
const loginController = require("../controllers/auth/login.controller");
const logoutController = require("../controllers/auth/logout.controller");
const refreshController = require("../controllers/auth/refresh.controller");
const forgotPasswordController = require("../controllers/auth/forgotPassword.controller");
const verifyOtpController = require("../controllers/auth/verifyOtp.controller");
const resetPasswordController = require("../controllers/auth/resetPassword.controller");
const verifyEmailController = require("../controllers/auth/verifyEmail.controller");
const updateProfileController = require("../controllers/auth/updateProfile.controller");
const recoveryController = require("../controllers/auth/recovery.controller");

const BLOCK_DISPOSABLE_EMAILS =
  String(process.env.BLOCK_DISPOSABLE_EMAILS || "1").trim() !== "0";

const router = express.Router();
router.use(authRateLimiter);

router.post(
  "/signup",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email")
      .custom((value) => {
        const email = normalizeEmail(value);
        if (!isDeliverableEmailFormat(email)) {
          throw new Error("Valid email is required");
        }
        if (BLOCK_DISPOSABLE_EMAILS && isDisposableEmail(email)) {
          throw new Error("Temporary email addresses are not allowed");
        }
        return true;
      })
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("fullName").optional().trim().isLength({ min: 2 }),
    body("wilaya").optional().trim(),
  ],
  validateRequest,
  sanitizeInput,
  signupController.signup
);

router.post("/login", loginController.login);
router.post("/logout", logoutController.logout);
router.post("/refresh", refreshController.refresh);

// Password Management
router.post("/forgot-password", forgotPasswordController.forgotPassword);
router.post("/verify-otp", verifyOtpController.verifyOtp);
router.post("/reset-password", resetPasswordController.resetPassword);

// Email Verification
router.post("/verify-email/request", verifyEmailController.requestVerification);
router.post("/verify-email/confirm", verifyEmailController.confirmVerification);

// Account Recovery
router.get("/recovery/options", recoveryController.getOptions);
router.post("/recovery/request", recoveryController.requestRecovery);

// Profile
router.put("/update", auth, updateProfileController.updateProfile);

module.exports = router;
