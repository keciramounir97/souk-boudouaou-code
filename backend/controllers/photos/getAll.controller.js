const { prisma } = require("../../config/database");
const { serializeUserPhoto } = require("../../utils/listing");

/**
 * Get User Photos
 * @route GET /api/user/photos
 */
exports.getUserPhotos = async (req, res) => {
  const photos = await prisma.userPhoto.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: { photos: photos.map(serializeUserPhoto) },
  });
};
