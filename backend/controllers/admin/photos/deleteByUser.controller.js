const { prisma } = require("../../../config/database");

exports.deletePhotosByUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }
    
    await prisma.userPhoto.deleteMany({ where: { userId } });
    res.json({ success: true, message: "Photos deleted" });
  } catch (err) {
    console.error("Admin delete photos error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};