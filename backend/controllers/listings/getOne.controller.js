const { prisma } = require("../../config/database");
const { serializeListing } = require("../../utils/helpers");

/**
 * Get One Listing
 * @route GET /api/listings/:id
 */
exports.getOneListing = async (req, res) => {
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
    return res.json({ success: false, message: "Not found" });
  }

  const isOwner = req.user && req.user.id === order.userId;
  const isAdmin = req.user && req.user.role === "ADMIN";

  if (order.status !== "published" && !isOwner && !isAdmin) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.json({ success: true, data: { listing: serializeListing(order) } });
};
