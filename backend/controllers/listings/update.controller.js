const { prisma } = require("../../config/database");
const { serializeListing } = require("../../utils/helpers");
const { buildListingPayload, recordUserPhoto } = require("../../utils/listing");
const { listingSchema } = require("../../schemas/validation");

/**
 * Update Listing
 * @route PUT /api/listings/:id
 */
exports.updateListing = async (req, res) => {
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

  const parsed = listingSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid listing payload" });
  }

  const payload = buildListingPayload(
    parsed.data,
    order.userId,
    req.file ? [req.file] : [],
    order
  );

  await prisma.order.update({ where: { id }, data: payload });

  if (req.file) {
    try {
      await recordUserPhoto({
        userId: order.userId,
        file: req.file,
        source: "listing",
        referenceId: order.id,
      });
    } catch (err) {
      if (err?.code === "PHOTO_LIMIT_REACHED") {
        return res.status(400).json({
          success: false,
          message:
            "Vous avez atteint la limite de 20 images. Supprimez-en avant d'ajouter davantage.",
        });
      }
      console.error("Photo record error:", err);
    }
  }

  const hydrated = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, wilaya: true },
      },
    },
  });

  res.json({ success: true, data: { listing: serializeListing(hydrated) } });
};
