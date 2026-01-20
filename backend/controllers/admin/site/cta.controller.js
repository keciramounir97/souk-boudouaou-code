const { prisma } = require("../../../config/database");
const { ctaSchema, DEFAULT_CTA } = require("../../../schemas/siteSettings");

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
 * Admin Get CTA
 * @route GET /api/admin/site/cta
 */
exports.getCta = async (_req, res) => {
  const data = await getSiteSettingJson("cta", DEFAULT_CTA);
  const parsed = ctaSchema.safeParse(data);
  return res.json({
    success: true,
    data: {
      cta: parsed.success ? { ...DEFAULT_CTA, ...parsed.data } : DEFAULT_CTA,
    },
  });
};

/**
 * Admin Update CTA
 * @route PUT /api/admin/site/cta
 */
exports.updateCta = async (req, res) => {
  let incoming = req.body?.cta ?? req.body;
  if (typeof incoming === "string") {
    try {
      incoming = JSON.parse(incoming);
    } catch {
      // ignore (fallback to schema parse)
    }
  }

  const parsed = ctaSchema.safeParse(incoming);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  const clearImage =
    String(req.body?.clearImage || "").trim() === "1" ||
    String(req.body?.clearImage || "")
      .trim()
      .toLowerCase() === "true";

  const normalized = { ...DEFAULT_CTA, ...parsed.data };
  if (clearImage) normalized.imageUrl = "";
  if (req.file) normalized.imageUrl = `/uploads/${req.file.filename}`;

  await setSiteSettingJson("cta", normalized);
  return res.json({ success: true, data: { cta: normalized } });
};
