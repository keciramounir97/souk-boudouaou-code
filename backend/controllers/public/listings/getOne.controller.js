const { prisma } = require("../../../config/database");
const { serializeListing } = require("../../../utils/helpers");

function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || null;
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

exports.getOneListing = async (req, res) => {
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
  
  await prisma.order.update({
    where: { id: listing.id },
    data: { views: { increment: 1 } },
  });
  
  await recordClick({ req, kind: "listing_view", listingId: listing.id });
  
  const refreshed = await prisma.order.findUnique({
    where: { id: listing.id },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, wilaya: true },
      },
    },
  });
  
  res.json({ success: true, data: { listing: serializeListing(refreshed) } });
};