const { prisma } = require("../../config/database");
const { sendEmailVerificationLink } = require("../../utils/email");
const {
  normalizeEmail,
  normalizeUsername,
  isDeliverableEmailFormat,
  isDisposableEmail,
  sanitizeUser,
} = require("../../utils/helpers");
const { updateProfileSchema } = require("../../schemas/validation");

const BLOCK_DISPOSABLE_EMAILS =
  String(process.env.BLOCK_DISPOSABLE_EMAILS || "1").trim() !== "0";

/**
 * Update User Profile
 * @route PUT /auth/update
 */
exports.updateProfile = async (req, res) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid update request" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updates = {};
    if (parsed.data.fullName !== undefined)
      updates.fullName = parsed.data.fullName;
    if (parsed.data.wilaya !== undefined) updates.wilaya = parsed.data.wilaya;

    // Super admin identity must remain stable
    if (user.role === "super_admin") {
      if (
        parsed.data.email !== undefined ||
        parsed.data.username !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message: "Super admin email/username cannot be changed",
        });
      }
    } else {
      if (parsed.data.email !== undefined)
        updates.email = normalizeEmail(parsed.data.email);
      if (parsed.data.username !== undefined)
        updates.username = normalizeUsername(parsed.data.username);
    }

    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;

    if (updates.email) {
      if (!isDeliverableEmailFormat(updates.email)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email format" });
      }
      if (BLOCK_DISPOSABLE_EMAILS && isDisposableEmail(updates.email)) {
        return res.status(400).json({
          success: false,
          message: "Temporary email addresses are not allowed",
        });
      }
      const existing = await prisma.user.findFirst({
        where: { email: updates.email, id: { not: user.id } },
      });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
    }

    if (updates.username) {
      const existing = await prisma.user.findFirst({
        where: { username: updates.username, id: { not: user.id } },
      });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Username already in use" });
      }
    }

    if (updates.phone) {
      const existing = await prisma.user.findFirst({
        where: { phone: updates.phone, id: { not: user.id } },
      });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Phone already in use" });
      }
    }

    const emailChanged =
      updates.email &&
      normalizeEmail(updates.email) !== normalizeEmail(user.email);
    if (emailChanged) {
      updates.verified = false;
      updates.emailVerifyTokenHash = null;
      updates.emailVerifyTokenExpiresAt = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    if (emailChanged) {
      sendEmailVerificationLink({ user: updatedUser, req }).catch(() => {});
    }

    return res.json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};
