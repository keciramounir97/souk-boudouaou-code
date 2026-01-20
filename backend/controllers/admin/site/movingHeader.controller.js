const crypto = require("crypto");
const { prisma } = require("../../../config/database");
const {
  movingHeaderSchema,
  DEFAULT_MOVING_HEADER,
  DEFAULT_MOVING_HEADER_FONT,
} = require("../../../schemas/siteSettings");

async function getSiteSettingJson(key, fallback) {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return fallback;
    return JSON.parse(row.value);
  } catch (err) {
    return fallback;
  }
}

async function setSiteSettingJson(key, value) {
  const payload = JSON.stringify(value);
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: payload },
    update: { value: payload },
  });
}

/**
 * Admin Get Moving Header
 * @route GET /api/admin/site/moving-header
 */
exports.getMovingHeader = async (req, res) => {
  const data = await getSiteSettingJson("moving_header", DEFAULT_MOVING_HEADER);
  const parsed = movingHeaderSchema.safeParse(data);
  const normalized = {
    ...DEFAULT_MOVING_HEADER,
    ...(parsed.success ? parsed.data : {}),
    fontConfig: parsed.success
      ? parsed.data.fontConfig || DEFAULT_MOVING_HEADER_FONT
      : DEFAULT_MOVING_HEADER_FONT,
  };
  return res.json({
    success: true,
    data: normalized,
  });
};

/**
 * Admin Update Moving Header
 * @route PUT /api/admin/site/moving-header
 */
exports.updateMovingHeader = async (req, res) => {
  const parsed = movingHeaderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  const normalized = {
    prefixFr: parsed.data.prefixFr ?? DEFAULT_MOVING_HEADER.prefixFr,
    prefixAr: parsed.data.prefixAr ?? DEFAULT_MOVING_HEADER.prefixAr,
    textColor: parsed.data.textColor ?? DEFAULT_MOVING_HEADER.textColor,
    heightPx: parsed.data.heightPx ?? DEFAULT_MOVING_HEADER.heightPx,
    translateWilayaAr:
      parsed.data.translateWilayaAr ?? DEFAULT_MOVING_HEADER.translateWilayaAr,
    backgroundColor:
      parsed.data.backgroundColor ?? DEFAULT_MOVING_HEADER.backgroundColor,
    animationDuration:
      parsed.data.animationDuration ?? DEFAULT_MOVING_HEADER.animationDuration,
    items: parsed.data.items.map((item) => ({
      ...item,
      id:
        item.id ||
        (crypto.randomUUID
          ? crypto.randomUUID()
          : crypto.randomBytes(16).toString("hex")),
      unit: "kg",
    })),
    fontConfig: parsed.data.fontConfig || DEFAULT_MOVING_HEADER_FONT,
  };

  await setSiteSettingJson("moving_header", normalized);
  return res.json({ success: true, data: normalized });
};
