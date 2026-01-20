const { prisma } = require("../../config/database");

/**
 * Get User Orders
 * @route GET /api/orders OR /api/user/orders
 */
exports.getUserOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: orders });
};
