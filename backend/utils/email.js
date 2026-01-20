const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { hashPassword } = require("./bcrypt");
const { prisma } = require("../config/database");
const os = require("os");

const OTP_TTL_MINUTES = Number.isFinite(Number(process.env.OTP_TTL_MINUTES))
  ? Number(process.env.OTP_TTL_MINUTES)
  : 10;

const APP_NAME = process.env.APP_NAME || "Tresor Maison";

let mailTransport;

function getMailTransport() {
  if (mailTransport) return mailTransport;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const authUser = process.env.SMTP_USER;
  const authPass = process.env.SMTP_PASS;
  mailTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: authUser ? { user: authUser, pass: authPass } : undefined,
  });
  return mailTransport;
}

function buildOtpEmail({ otp }) {
  const minutes = Number.isFinite(OTP_TTL_MINUTES) ? OTP_TTL_MINUTES : 10;
  const subject = `${APP_NAME} password reset code`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2 style="margin:0 0 12px;">${APP_NAME} password reset</h2>
      <p>Your one-time code is:</p>
      <div style="font-size:24px; font-weight:700; letter-spacing:4px; margin:12px 0;">${otp}</div>
      <p>This code expires in ${minutes} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;
  return { subject, html };
}

async function sendOtpEmail({ to, otp }) {
  if (!process.env.SMTP_HOST) return;
  const transport = getMailTransport();
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    `no-reply@${APP_NAME.replace(/\s+/g, "").toLowerCase()}.local`;
  const { subject, html } = buildOtpEmail({ otp });
  await transport.sendMail({ from, to, subject, html });
}

async function sendEmailVerificationLink({ user, req }) {
  if (!process.env.SMTP_HOST) return;
  if (!user?.email) return;
  if (user.verified === true) return;

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

  const verifyLink =
    (process.env.APP_ORIGIN || "http://localhost:5173") +
    `/auth/verify-email?email=${encodeURIComponent(
      user.email
    )}&token=${encodeURIComponent(tokenPlain)}`;

  try {
    const transport = getMailTransport();
    const from =
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      `no-reply@${APP_NAME.replace(/\s+/g, "").toLowerCase()}.local`;
    await transport.sendMail({
      from,
      to: user.email,
      subject: `${APP_NAME} email verification`,
      html: `<p>Verify your email by clicking the link:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>This link expires in 24 hours.</p>`,
    });
  } catch (e) {
    console.error("Verify email send failed:", e);
  }

  logAuthEvent("verify_email_request", {
    userId: user.id,
    ip:
      req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.socket?.remoteAddress,
    ok: true,
  });
}

function logAuthEvent(type, meta) {
  try {
    const payload = {
      ts: new Date().toISOString(),
      host: os.hostname(),
      type,
      userId: meta?.userId || null,
      ip: meta?.ip || null,
      ok: meta?.ok !== false,
      reason: meta?.reason || undefined,
    };
    console.log("[AUTH]", JSON.stringify(payload));
  } catch {}
}

module.exports = {
  getMailTransport,
  buildOtpEmail,
  sendOtpEmail,
  sendEmailVerificationLink,
  logAuthEvent,
  OTP_TTL_MINUTES,
  APP_NAME,
};
