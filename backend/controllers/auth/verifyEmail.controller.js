const { prisma } = require("../../config/database");
const { safeCompareHash } = require("../../utils/bcrypt");
const {
  sendEmailVerificationLink,
  logAuthEvent,
} = require("../../utils/email");
const {
  normalizeEmail,
  isDeliverableEmailFormat,
  isDisposableEmail,
} = require("../../utils/helpers");
const {
  emailVerifyRequestSchema,
  emailVerifyConfirmSchema,
} = require("../../schemas/validation");

const BLOCK_DISPOSABLE_EMAILS =
  String(process.env.BLOCK_DISPOSABLE_EMAILS || "1").trim() !== "0";

/**
 * Request Email Verification
 * @route POST /auth/verify-email/request
 */
exports.requestVerification = async (req, res) => {
  try {
    const parsed = emailVerifyRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const email = normalizeEmail(parsed.data.email);
    if (!isDeliverableEmailFormat(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (BLOCK_DISPOSABLE_EMAILS && isDisposableEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Temporary email addresses are not allowed",
      });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists, email was sent",
      });
    }

    await sendEmailVerificationLink({ user, req });
    return res.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.error("Verify email request error:", err);
    return res.status(500).json({ success: false, message: "Request failed" });
  }
};

/**
 * Confirm Email Verification
 * @route POST /auth/verify-email/confirm
 */
exports.confirmVerification = async (req, res) => {
  try {
    const parsed = emailVerifyConfirmSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const email = normalizeEmail(parsed.data.email);
    const token = parsed.data.token;
    const user = await prisma.user.findFirst({ where: { email } });
    const match = await safeCompareHash(
      token,
      user ? user.emailVerifyTokenHash : null
    );
    const expired =
      !user?.emailVerifyTokenExpiresAt ||
      user.emailVerifyTokenExpiresAt < new Date();

    if (!user || !match || expired) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        emailVerifyTokenHash: null,
        emailVerifyTokenExpiresAt: null,
      },
    });

    logAuthEvent("verify_email_confirm", {
      userId: user.id,
      ip:
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress,
      ok: true,
    });

    return res.json({ success: true, message: "Email verified" });
  } catch (err) {
    console.error("Verify email confirm error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed" });
  }
};
