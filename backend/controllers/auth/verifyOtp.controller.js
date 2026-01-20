const { prisma } = require("../../config/database");
const { safeCompareHash } = require("../../utils/bcrypt");
const { normalizeEmail, asyncHandler } = require("../../utils/helpers");
const { otpSchema } = require("../../schemas/validation");

/**
 * Verify OTP Controller
 * @route POST /auth/verify-otp
 */
exports.verifyOtp = asyncHandler(async (req, res) => {
  const parsed = otpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request" });
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

  return res.json({ success: true, message: "OTP verified" });
});
