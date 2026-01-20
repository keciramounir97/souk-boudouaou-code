const { prisma } = require("../../../config/database");

exports.deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot delete yourself" });
    }
    
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    
    if (target.role === "super_admin") {
      return res.status(403).json({ success: false, message: "Cannot delete super admin" });
    }
    
    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};
