const { prisma } = require("../../../config/database");

exports.getAllInquiries = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const listingId = req.query.listingId ? Number(req.query.listingId) : undefined;
    const userId = req.query.userId ? Number(req.query.userId) : undefined;

    const where = {};
    if (Number.isFinite(listingId)) where.listingId = listingId;
    if (Number.isFinite(userId)) where.userId = userId;

    const [total, inquiryRows] = await prisma.$transaction([
      prisma.inquiry.count({ where }),
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    const userIds = Array.from(new Set(inquiryRows.map((r) => r.userId).filter(Boolean)));
    const listingIds = Array.from(new Set(inquiryRows.map((r) => r.listingId)));

    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            role: true,
            phone: true,
            wilaya: true,
          },
        })
      : [];
      
    const listings = listingIds.length
      ? await prisma.order.findMany({
          where: { id: { in: listingIds } },
          select: { id: true, title: true, slug: true, userId: true },
        })
      : [];

    const userById = new Map(users.map((u) => [u.id, u]));
    const listingById = new Map(listings.map((l) => [l.id, l]));

    const rows = inquiryRows.map((obj) => ({
      ...obj,
      user: obj.userId ? userById.get(obj.userId) || null : null,
      listing: listingById.get(obj.listingId) || null,
    }));

    return res.json({
      success: true,
      data: { inquiries: rows, total, page, limit },
    });
  } catch (err) {
    console.error("Admin inquiries error:", err);
    return res.status(500).json({ success: false, message: "Request failed" });
  }
};