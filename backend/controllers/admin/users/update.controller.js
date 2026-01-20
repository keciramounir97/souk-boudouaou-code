const { z } = require("zod");
const { prisma } = require("../../../config/database");
const { sanitizeUser } = require("../../../utils/helpers");

exports.updateUser = async (req, res) => {
  try {
    const schema = z
      .object({
        role: z.enum(["user", "ADMIN"]).optional(),
        isActive: z.boolean().optional(),
        verified: z.boolean().optional(),
      })
      .refine((v) => Object.keys(v).length > 0, {
        message: "No changes provided",
      });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (target.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot modify a super admin user",
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
    });
    
    res.json({ success: true, data: { user: sanitizeUser(updated) } });
  } catch (err) {
    console.error("Admin user update error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};
