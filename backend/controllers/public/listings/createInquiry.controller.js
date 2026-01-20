const { z } = require("zod");
const { prisma } = require("../../../config/database");
const { normalizeEmail } = require("../../../utils/helpers");

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    null
  );
}

async function recordClick({ req, kind, listingId }) {
  try {
    await prisma.clickEvent.create({
      data: {
        userId: req.user?.id || null,
        listingId: listingId || null,
        kind,
        path: req.path,
        userAgent: req.headers["user-agent"] || null,
        ip: getClientIp(req),
      },
    });
  } catch {}
}

/**
 * Create Inquiry on Listing
 * @route POST /api/public/listings/:slugOrId/inquiries
 */
exports.createInquiry = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const numericId = Number(slugOrId);
    const listing =
      (await prisma.order.findUnique({ where: { slug: slugOrId } })) ||
      (Number.isFinite(numericId)
        ? await prisma.order.findUnique({ where: { id: numericId } })
        : null);

    if (!listing) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (listing.status !== "published") {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const schema = z.object({
      message: z.string().trim().min(5).max(1200),
      name: z.string().trim().min(2).max(120).optional(),
      email: z.string().email().optional(),
      phone: z.string().trim().min(3).max(40).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    const userId = req.user?.id || null;
    const fallbackName = req.user?.fullName || req.user?.username || undefined;
    const fallbackEmail = req.user?.email || undefined;
    const fallbackPhone = req.user?.phone || undefined;

    const created = await prisma.inquiry.create({
      data: {
        listingId: listing.id,
        userId,
        message: parsed.data.message,
        name: parsed.data.name || fallbackName,
        email: parsed.data.email
          ? normalizeEmail(parsed.data.email)
          : fallbackEmail,
        phone: parsed.data.phone || fallbackPhone,
      },
    });

    await recordClick({
      req,
      kind: "listing_inquiry",
      listingId: listing.id,
    });

    return res.json({ success: true, data: { inquiry: created } });
  } catch (err) {
    console.error("Create inquiry error:", err);
    return res.status(500).json({ success: false, message: "Create failed" });
  }
};
