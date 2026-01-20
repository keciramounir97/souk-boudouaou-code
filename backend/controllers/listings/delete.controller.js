const { prisma } = require("../../config/database");

/**
 * Delete Listing
 * @route DELETE /api/listings/:id
 */
exports.deleteListing = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return res.json({ success: false, message: "Not found" });
  }

  if (order.userId !== req.user.id) {
    return res.json({ success: false, message: "Not allowed" });
  }

  await prisma.order.delete({ where: { id } });
  res.json({ success: true, message: "Deleted" });
};
