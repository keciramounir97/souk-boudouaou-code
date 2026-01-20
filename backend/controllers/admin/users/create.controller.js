const { z } = require("zod");
const crypto = require("crypto");
const { prisma } = require("../../../config/database");
const { hashPassword, validatePassword } = require("../../../utils/bcrypt");
const { normalizeEmail, normalizeUsername, isDeliverableEmailFormat, isDisposableEmail, sanitizeUser } = require("../../../utils/helpers");
const { sendEmailVerificationLink } = require("../../../utils/email");

const BLOCK_DISPOSABLE_EMAILS = String(process.env.BLOCK_DISPOSABLE_EMAILS || "1").trim() !== "0";

exports.createUser = async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      username: z.string().trim().min(3).optional(),
      fullName: z.string().trim().min(2).optional(),
      password: z.string().min(8),
      role: z.enum(["user", "ADMIN"]).optional(),
      wilaya: z.string().trim().optional(),
      phone: z.string().trim().min(3).optional(),
      isActive: z.boolean().optional(),
      verified: z.boolean().optional(),
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const email = normalizeEmail(parsed.data.email);
    if (!isDeliverableEmailFormat(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    
    if (BLOCK_DISPOSABLE_EMAILS && isDisposableEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Temporary email addresses are not allowed",
      });
    }

    const passwordError = validatePassword(parsed.data.password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const existingEmail = await prisma.user.findFirst({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    let username = parsed.data.username ? normalizeUsername(parsed.data.username) : "";
    if (!username) {
      const local = String(email).split("@")[0] || "user";
      const base = normalizeUsername(local).replace(/[^a-z0-9_]/g, "") || "user";
      username = base;
      for (let i = 0; i < 5; i++) {
        const exists = await prisma.user.findFirst({ where: { username } });
        if (!exists) break;
        username = `${base}${crypto.randomInt(1000, 10000)}`;
      }
    }
    
    const existingUsername = await prisma.user.findFirst({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ success: false, message: "Username already in use" });
    }

    const phone = parsed.data.phone ? String(parsed.data.phone).trim() : undefined;
    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({ success: false, message: "Phone already in use" });
      }
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const role = parsed.data.role || "user";
    const verified = parsed.data.verified === undefined ? true : !!parsed.data.verified;
    const isActive = parsed.data.isActive === undefined ? true : !!parsed.data.isActive;

    const created = await prisma.user.create({
      data: {
        email,
        username,
        fullName: parsed.data.fullName,
        wilaya: parsed.data.wilaya,
        phone,
        role,
        verified,
        isActive,
        passwordHash,
      },
    });

    if (verified !== true) {
      sendEmailVerificationLink({ user: created, req }).catch(() => {});
    }

    return res.json({ success: true, data: { user: sanitizeUser(created) } });
  } catch (err) {
    console.error("Admin create user error:", err);
    return res.status(500).json({ success: false, message: "Create failed" });
  }
};
