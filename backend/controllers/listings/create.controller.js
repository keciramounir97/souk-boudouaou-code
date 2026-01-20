const { prisma } = require("../../config/database");
const { serializeListing } = require("../../utils/helpers");
const { slugify, makeUniqueSlug } = require("../../utils/helpers");
const { buildListingPayload, recordUserPhoto } = require("../../utils/listing");
const { listingSchema } = require("../../schemas/validation");

/**
 * Create Listing
 * @route POST /api/listings
 */
exports.createListing = async (req, res) => {
  try {
    const parsed = listingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid listing payload" });
    }

    const baseSlug = slugify(parsed.data.slug || parsed.data.title);
    const uniqueSlug = await makeUniqueSlug(baseSlug);
    const payload = buildListingPayload(
      { ...parsed.data, slug: uniqueSlug },
      req.user.id,
      req.file ? [req.file] : []
    );

    const created = await prisma.order.create({ data: payload });

    if (req.file) {
      try {
        await recordUserPhoto({
          userId: req.user.id,
          file: req.file,
          source: "listing",
          referenceId: created.id,
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
      where: { id: created.id },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, wilaya: true },
        },
      },
    });

    res.json({ success: true, data: { listing: serializeListing(hydrated) } });
  } catch (err) {
    console.error("Create listing error:", err);
    const body = { success: false, message: "Create failed" };
    if (String(process.env.NODE_ENV).toLowerCase() === "development") {
      body.error = err?.message || String(err);
    }
    res.status(500).json(body);
  }
};
