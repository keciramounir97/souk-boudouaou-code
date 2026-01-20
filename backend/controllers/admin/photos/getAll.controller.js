const { prisma } = require("../../../config/database");
const { serializeUserPhoto } = require("../../../utils/listing");

/**
 * Admin Get All Photos
 * @route GET /api/admin/photos
 */
exports.getAllPhotos = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const userId = req.query.userId ? Number(req.query.userId) : undefined;

    const where = {};
    if (Number.isFinite(userId)) where.userId = userId;

    const [total, photos] = await prisma.$transaction([
      prisma.userPhoto.count({ where }),
      prisma.userPhoto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    res.json({
      success: true,
      data: { photos: photos.map(serializeUserPhoto), total, page, limit },
    });
  } catch (err) {
    console.error("Admin photos list error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch photos" });
  }
};
