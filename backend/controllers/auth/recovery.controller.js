const crypto = require("crypto");
const { prisma } = require("../../config/database");
const { hashPassword } = require("../../utils/bcrypt");
const {
  getMailTransport,
  sendOtpEmail,
  OTP_TTL_MINUTES,
  APP_NAME,
} = require("../../utils/email");
const { normalizeEmail, generateOtp } = require("../../utils/helpers");

/**
 * Get Recovery Options
 * @route GET /auth/recovery/options
 */
exports.getOptions = async (req, res) => {
  return res.json({ success: true, data: ["email_otp", "email_link"] });
};

/**
 * Request Account Recovery
 * @route POST /auth/recovery/request
 */
exports.requestRecovery = async (req, res) => {
  try {
    const method = String(req.body?.method || "").toLowerCase();
    const email = normalizeEmail(req.body?.email || "");

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists, instructions were sent",
      });
    }

    if (method === "email_link") {
      const tokenPlain = crypto.randomBytes(32).toString("hex");
      const tokenHash = await hashPassword(tokenPlain);
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifyTokenHash: tokenHash,
          emailVerifyTokenExpiresAt: expires,
        },
      });

      const link =
        (process.env.APP_ORIGIN || "http://localhost:5173") +
        `/auth/reset?email=${encodeURIComponent(
          email
        )}&token=${encodeURIComponent(tokenPlain)}`;

      try {
        const transport = getMailTransport();
        const from =
          process.env.SMTP_FROM ||
          process.env.SMTP_USER ||
          `no-reply@${APP_NAME.replace(/\s+/g, "").toLowerCase()}.local`;
        await transport.sendMail({
          from,
          to: email,
          subject: `${APP_NAME} account recovery`,
          html: `<p>Use this link to recover your account:</p><p><a href="${link}">${link}</a></p><p>Link expires in 24 hours.</p>`,
        });
      } catch (e) {
        console.error("Recovery email send failed:", e);
      }
      return res.json({ success: true, message: "Recovery link sent" });
    }

    // Default: email_otp
    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const ttl = Number.isFinite(OTP_TTL_MINUTES) ? OTP_TTL_MINUTES : 10;
    const otpExpiresAt = new Date(Date.now() + ttl * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpHash, otpExpiresAt },
    });

    try {
      await sendOtpEmail({ to: email, otp });
    } catch (err) {
      console.error("Recovery OTP email failed:", err);
    }

    return res.json({ success: true, message: "Recovery OTP sent" });
  } catch (err) {
    console.error("Recovery request error:", err);
    return res.status(500).json({ success: false, message: "Recovery failed" });
  }
};
