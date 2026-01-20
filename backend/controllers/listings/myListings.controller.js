const { prisma } = require("../../config/database");
const { serializeListing } = require("../../utils/helpers");

/**
 * Get My Listings
 * @route GET /api/user/my-listings
 */
exports.getMyListings = async (req, res) => {
  const listings = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: listings.map(serializeListing).filter(Boolean),
  });
};
