const { prisma } = require("../../config/database");
const { hashPassword } = require("../../utils/bcrypt");
const { sendOtpEmail, OTP_TTL_MINUTES } = require("../../utils/email");
const { normalizeEmail, generateOtp, asyncHandler } = require("../../utils/helpers");
const { forgotPasswordSchema } = require("../../schemas/validation");

const DEBUG_RETURN_OTP =
  String(process.env.DEBUG_RETURN_OTP || "").trim() === "1" &&
  String(process.env.NODE_ENV || "").toLowerCase() !== "production";

/**
 * Forgot Password Controller - Send OTP
 * @route POST /auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request" });
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findFirst({ where: { email } });
  let debugOtp;

  if (user) {
    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const ttl = Number.isFinite(OTP_TTL_MINUTES) ? OTP_TTL_MINUTES : 10;
    const otpExpiresAt = new Date(Date.now() + ttl * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpHash, otpExpiresAt },
    });

    if (DEBUG_RETURN_OTP) debugOtp = otp;

    try {
      await sendOtpEmail({ to: email, otp });
    } catch (err) {
      console.error("OTP email failed:", err);
    }
  }

  const response = {
    success: true,
    message: "If an account exists, an OTP has been sent",
  };
  if (DEBUG_RETURN_OTP && debugOtp) response.otp = debugOtp;
  return res.json(response);
});
