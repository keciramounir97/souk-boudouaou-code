const { prisma } = require("../../config/database");
const { serializeListing } = require("../../utils/helpers");

/**
 * Get All Listings (Public)
 * @route GET /api/listings
 */
exports.getAllListings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [count, orders] = await prisma.$transaction([
      prisma.order.count({ where: { status: "published" } }),
      prisma.order.findMany({
        where: { status: "published" },
        include: { user: { select: { fullName: true, wilaya: true } } },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
    ]);

    const totalPages = Math.ceil(count / limit);
    const listings = orders.map(serializeListing).filter(Boolean);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (err) {
    console.error("Listings fetch error:", err);
    // Return empty array instead of error to prevent frontend crash
    res.status(200).json({
      success: true,
      data: {
        listings: [],
        pagination: {
          page: Math.max(1, parseInt(req.query.page) || 1),
          limit: Math.min(50, Math.max(1, parseInt(req.query.limit) || 20)),
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  }
};
