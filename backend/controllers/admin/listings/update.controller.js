const { prisma } = require("../../../config/database");
const { buildListingPayload } = require("../../../utils/listing");
const { listingSchema } = require("../../../schemas/validation");

exports.updateListing = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  
  const listing = await prisma.order.findUnique({ where: { id } });
  if (!listing) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  
  const parsed = listingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid listing payload" });
  }
  
  const payload = buildListingPayload(parsed.data, listing.userId, req.file ? [req.file] : [], listing);
  const updated = await prisma.order.update({ where: { id }, data: payload });
  res.json({ success: true, data: { listing: updated } });
};
