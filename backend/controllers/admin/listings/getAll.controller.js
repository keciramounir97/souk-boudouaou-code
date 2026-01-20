const { prisma } = require("../../../config/database");
const { serializeListing } = require("../../../utils/helpers");

/**
 * Admin Get All Listings
 * @route GET /api/admin/listings
 */
exports.getAllListings = async (req, res) => {
  const { page = 1, limit = 20, q = "", category, status, wilaya } = req.query;

  const where = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (wilaya) where.wilaya = wilaya;
  if (q) where.title = { contains: String(q) };

  const take = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (Math.max(1, Number(page) || 1) - 1) * take;

  const [total, rows] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, fullName: true, wilaya: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
  ]);

  const data = rows.map(serializeListing).filter(Boolean);

  res.json({
    success: true,
    data: {
      listings: data,
      total,
      page: Math.max(1, Number(page) || 1),
      limit: take,
    },
  });
};
