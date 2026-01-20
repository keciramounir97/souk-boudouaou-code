const { prisma } = require("../../config/database");

/**
 * Delete All User Photos
 * @route DELETE /api/user/photos
 */
exports.deleteAllPhotos = async (req, res) => {
  await prisma.userPhoto.deleteMany({ where: { userId: req.user.id } });
  res.json({ success: true });
};
