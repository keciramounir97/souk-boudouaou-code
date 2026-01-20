const { prisma } = require("../../../config/database");
const { slugify, makeUniqueSlug } = require("../../../utils/helpers");
const { buildListingPayload } = require("../../../utils/listing");
const { listingSchema } = require("../../../schemas/validation");

/**
 * Admin Create Listing
 * @route POST /api/admin/listings
 */
exports.createListing = async (req, res) => {
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
  res.json({ success: true, data: { listing: created } });
};
