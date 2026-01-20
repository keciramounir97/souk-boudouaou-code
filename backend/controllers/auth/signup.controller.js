const { prisma } = require("../../config/database");
const { hashPassword, validatePassword } = require("../../utils/bcrypt");
const {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} = require("../../utils/jwt");
const {
  sendEmailVerificationLink,
  logAuthEvent,
} = require("../../utils/email");
const {
  normalizeEmail,
  normalizeUsername,
  sanitizeUser,
  asyncHandler,
} = require("../../utils/helpers");
const { signupSchema } = require("../../schemas/validation");

/**
 * User Signup Controller
 * @route POST /auth/signup
 */
exports.signup = asyncHandler(async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signup request" });
  }

  const passwordError = validatePassword(parsed.data.password);
  if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
  }

  const username = normalizeUsername(parsed.data.username);
  const email = normalizeEmail(parsed.data.email);
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Email or username already in use",
    });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      fullName: parsed.data.fullName,
      wilaya: parsed.data.wilaya,
      role: "user",
      isActive: true,
      verified: false,
    },
  });

  // Send verification email in background
  sendEmailVerificationLink({ user: newUser, req }).catch(() => {});

  const token = signAccessToken(newUser);
  const refreshToken = signRefreshToken(newUser);
  setAuthCookies(res, { accessToken: token, refreshToken });

  const response = { success: true, user: sanitizeUser(newUser), token };
  if (refreshToken) response.refreshToken = refreshToken;

  logAuthEvent("signup", {
    userId: newUser.id,
    ip:
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress,
    ok: true,
  });

  return res.status(201).json(response);
});
