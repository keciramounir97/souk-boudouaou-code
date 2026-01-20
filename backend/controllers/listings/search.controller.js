const { prisma } = require("../../config/database");
const { serializeListing } = require("../../utils/helpers");

/**
 * Search Listings
 * @route GET /api/listings/search
 */
exports.searchListings = async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase().trim();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    if (q.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const where = {
      title: { contains: q },
      status: "published",
    };

    const [count, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { user: { select: { fullName: true, wilaya: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
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
    console.error("Search error:", err);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};
