const { z } = require("zod");
const { prisma } = require("../../config/database");
const { serializeListing } = require("../../utils/helpers");

/**
 * Update Listing Status
 * @route PATCH /api/listings/:id/status
 */
exports.updateStatus = async (req, res) => {
  const schema = z.object({ status: z.enum(["draft", "published"]) });
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  const isOwner = order.userId === req.user.id;
  const isAdmin = req.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  res.json({ success: true, data: { listing: serializeListing(updated) } });
};
