const { prisma } = require("../../config/database");

/**
 * Delete Single Photo
 * @route DELETE /api/user/photos/:id
 */
exports.deletePhoto = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  const photo = await prisma.userPhoto.findUnique({ where: { id } });
  if (!photo || photo.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  await prisma.userPhoto.delete({ where: { id } });
  res.json({ success: true });
};
