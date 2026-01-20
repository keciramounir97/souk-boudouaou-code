const { prisma } = require("../../../config/database");
const {
  heroSlidesSchema,
  DEFAULT_HERO_SLIDES,
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
 * Get Hero Slides (Public)
 * @route GET /api/public/site/hero-slides
 */
exports.getHeroSlides = async (_req, res) => {
  try {
    const data = await getSiteSettingJson("hero_slides", DEFAULT_HERO_SLIDES);
    const parsed = heroSlidesSchema.safeParse(data);
    return res.json({
      success: true,
      data: parsed.success ? parsed.data : DEFAULT_HERO_SLIDES,
    });
  } catch (error) {
    console.error("[Hero Slides Controller] Error:", error);
    return res.status(200).json({
      success: true,
      data: DEFAULT_HERO_SLIDES,
    });
  }
};
