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

/**
 * Get CTA Settings (Public)
 * @route GET /api/public/site/cta
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
