const { prisma } = require("../../../config/database");

/**
 * Get Public Order
 * @route GET /api/public/orders/:id
 */
exports.getOneOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, wilaya: true },
      },
    },
  });

  if (!order) {
    return res.json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, data: order });
};
