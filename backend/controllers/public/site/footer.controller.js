const { prisma } = require("../../../config/database");
const {
  footerSchema,
  DEFAULT_FOOTER,
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

/**
 * Get Footer Settings (Public)
 * @route GET /api/public/site/footer
 */
exports.getFooter = async (_req, res) => {
  try {
    const data = await getSiteSettingJson("footer", DEFAULT_FOOTER);
    const parsed = footerSchema.safeParse(data);
    const normalized = parsed.success
      ? { ...DEFAULT_FOOTER, ...parsed.data }
      : DEFAULT_FOOTER;
    return res.json({ success: true, data: { footer: normalized } });
  } catch (error) {
    console.error("[Footer Controller] Error:", error);
    return res.status(200).json({ success: true, data: { footer: DEFAULT_FOOTER } });
  }
};
