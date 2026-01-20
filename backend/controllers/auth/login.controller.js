const { prisma } = require("../../config/database");
const { safeCompareHash } = require("../../utils/bcrypt");
const {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} = require("../../utils/jwt");
const { logAuthEvent } = require("../../utils/email");
const {
  normalizeEmail,
  normalizeUsername,
  isEmail,
  isDeliverableEmailFormat,
  isDisposableEmail,
  sanitizeUser,
  asyncHandler,
} = require("../../utils/helpers");
const { loginSchema } = require("../../schemas/validation");

const BLOCK_DISPOSABLE_EMAILS =
  String(process.env.BLOCK_DISPOSABLE_EMAILS || "1").trim() !== "0";
const REQUIRE_EMAIL_VERIFICATION =
  String(process.env.REQUIRE_EMAIL_VERIFICATION || "1").trim() !== "0";

/**
 * User Login Controller
 * @route POST /auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid login request",
      errors: parsed.error?.errors || [],
    });
  }

  const identifier =
    parsed.data.identifier || parsed.data.email || parsed.data.username;
  if (!identifier) {
    return res
      .status(400)
      .json({ success: false, message: "Email or username required" });
  }

  // Check if identifier is actually a valid email format (not just contains @)
  // Use a basic regex first to avoid strict validation issues
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const looksLikeValidEmail = basicEmailRegex.test(String(identifier).trim());
  
  if (looksLikeValidEmail) {
    const email = normalizeEmail(identifier);
    // Only check disposable emails if enabled
    if (BLOCK_DISPOSABLE_EMAILS && isDisposableEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Temporary email addresses are not allowed",
      });
    }
  }

  // Use isEmail() for final determination, but fallback to username if format is invalid
  // This allows usernames that contain @ to be treated as usernames
  const lookup = looksLikeValidEmail && isEmail(identifier)
    ? { email: normalizeEmail(identifier) }
    : { username: normalizeUsername(identifier) };

  const user = await prisma.user.findFirst({ where: lookup });
  const match = await safeCompareHash(
    parsed.data.password,
    user ? user.passwordHash : null
  );

  if (!user || !match) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  if (user.isActive === false) {
    return res
      .status(403)
      .json({ success: false, message: "Account disabled" });
  }

  // Skip email verification requirement for super_admin and ADMIN roles
  if (REQUIRE_EMAIL_VERIFICATION && user.verified !== true && user.role !== "super_admin" && user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Email not verified. Please verify your email.",
    });
  }

  // Create a new session token (like old backend for revokable tokens)
  const sessionToken = require("crypto").randomBytes(32).toString("hex");
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { sessionToken, lastLogin: new Date() },
  });

  const token = signAccessToken(updatedUser);
  const refreshToken = signRefreshToken(updatedUser);
  setAuthCookies(res, { accessToken: token, refreshToken });

  const response = { success: true, user: sanitizeUser(updatedUser), token };
  if (refreshToken) response.refreshToken = refreshToken;

  logAuthEvent("login", {
    userId: user.id,
    ip:
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress,
    ok: true,
  });

  return res.json(response);
});
