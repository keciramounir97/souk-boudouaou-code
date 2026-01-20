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

/**
 * Get Moving Header (Public)
 * @route GET /api/public/site/moving-header
 */
exports.getMovingHeader = async (_req, res) => {
  try {
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
  } catch (error) {
    console.error("[Moving Header Controller] Error:", error);
    return res.status(200).json({
      success: true,
      data: {
        ...DEFAULT_MOVING_HEADER,
        fontConfig: DEFAULT_MOVING_HEADER_FONT,
      },
    });
  }
};
