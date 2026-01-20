const { prisma } = require("../../config/database");
const {
  normalizeCategoryValue,
  normalizeEmail,
} = require("../../utils/helpers");

/**
 * Update Order
 * @route PUT /api/orders/:id
 */
exports.updateOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return res.json({ success: false, message: "Order not found" });
  }

  if (order.userId !== req.user.id) {
    return res.json({ success: false, message: "Not allowed" });
  }

  const updatedPhoto = req.file ? `/uploads/${req.file.filename}` : order.photo;
  const data = {};

  if (req.body.title !== undefined) data.title = String(req.body.title);
  if (req.body.category !== undefined)
    data.category = normalizeCategoryValue(req.body.category);
  if (req.body.wilaya !== undefined) data.wilaya = String(req.body.wilaya);
  if (req.body.commune !== undefined) data.commune = String(req.body.commune);
  if (req.body.details !== undefined) data.details = String(req.body.details);
  if (req.body.description !== undefined)
    data.description = String(req.body.description);
  if (req.body.status !== undefined)
    data.status = String(req.body.status).toLowerCase();
  if (req.body.unit !== undefined) data.unit = String(req.body.unit);
  if (req.body.contactPhone !== undefined)
    data.contactPhone = String(req.body.contactPhone);
  if (req.body.contactEmail !== undefined)
    data.contactEmail = normalizeEmail(req.body.contactEmail);
  if (req.body.pricePerKg !== undefined && req.body.pricePerKg !== "")
    data.pricePerKg = Number(req.body.pricePerKg);
  if (req.body.vaccinated !== undefined)
    data.vaccinated = String(req.body.vaccinated).toLowerCase() === "true";
  if (req.body.preparationDate)
    data.preparationDate = new Date(req.body.preparationDate);

  if (req.body.tags !== undefined) {
    if (Array.isArray(req.body.tags)) {
      data.tags = JSON.stringify(req.body.tags);
    } else if (typeof req.body.tags === "string" && req.body.tags.trim()) {
      data.tags = JSON.stringify(
        req.body.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    }
  }

  data.photo = updatedPhoto;

  const updated = await prisma.order.update({ where: { id }, data });
  res.json({ success: true, data: updated });
};
