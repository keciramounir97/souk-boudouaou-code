const { prisma } = require("../../../config/database");

exports.getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const q = String(req.query.q || "").trim();
    const role = req.query.role ? String(req.query.role) : undefined;
    const isActive = req.query.isActive === undefined ? undefined : String(req.query.isActive).toLowerCase() === "true";

    const where = {};
    if (role) where.role = role;
    if (typeof isActive === "boolean") where.isActive = isActive;
    if (q) {
      where.OR = [
        { email: { contains: q } },
        { username: { contains: q } },
        { fullName: { contains: q } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
          wilaya: true,
          role: true,
          isActive: true,
          verified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: { users, total, page, limit },
    });
  } catch (err) {
    console.error("Admin users list error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
