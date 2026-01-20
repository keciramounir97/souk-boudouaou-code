const { prisma } = require("../../../config/database");

/**
 * Admin Get One Listing
 * @route GET /api/admin/listings/:id
 */
exports.getOneListing = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  const listing = await prisma.order.findUnique({ where: { id } });
  if (!listing) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.json({ success: true, data: { listing } });
};
