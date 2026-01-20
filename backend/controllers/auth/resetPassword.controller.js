const { prisma } = require("../../config/database");
const {
  hashPassword,
  validatePassword,
  safeCompareHash,
} = require("../../utils/bcrypt");
const { normalizeEmail, asyncHandler } = require("../../utils/helpers");
const { resetPasswordSchema } = require("../../schemas/validation");

/**
 * Reset Password Controller
 * @route POST /auth/reset-password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request" });
  }

  const passwordError = validatePassword(parsed.data.password);
  if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findFirst({ where: { email } });
  const match = await safeCompareHash(
    parsed.data.otp,
    user ? user.otpHash : null
  );
  const expired = !user?.otpExpiresAt || user.otpExpiresAt < new Date();

  if (!user || !match || expired) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      otpHash: null,
      otpExpiresAt: null,
      verified: true,
    },
  });

  return res.json({ success: true, message: "Password updated" });
});
