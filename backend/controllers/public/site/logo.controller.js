const { prisma } = require("../../../config/database");
const {
  logoSchema,
  DEFAULT_LOGO,
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
 * Get Logo (Public)
 * @route GET /api/public/site/logo
 */
exports.getLogo = async (_req, res) => {
  try {
    const data = await getSiteSettingJson("logo", DEFAULT_LOGO);
    const parsed = logoSchema.safeParse(data);
    const normalized = parsed.success
      ? { ...DEFAULT_LOGO, ...parsed.data }
      : DEFAULT_LOGO;
    return res.json({ success: true, data: { logo: normalized } });
  } catch (error) {
    console.error("[Logo Controller] Error:", error);
    return res.status(200).json({ success: true, data: { logo: DEFAULT_LOGO } });
  }
};
