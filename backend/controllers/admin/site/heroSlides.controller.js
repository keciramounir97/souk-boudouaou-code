const crypto = require("crypto");
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

async function setSiteSettingJson(key, value) {
  const payload = JSON.stringify(value);
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: payload },
    update: { value: payload },
  });
}

/**
 * Admin Get Hero Slides
 * @route GET /api/admin/site/hero-slides
 */
exports.getHeroSlides = async (req, res) => {
  const data = await getSiteSettingJson("hero_slides", DEFAULT_HERO_SLIDES);
  const parsed = heroSlidesSchema.safeParse(data);
  return res.json({
    success: true,
    data: parsed.success ? parsed.data : DEFAULT_HERO_SLIDES,
  });
};

/**
 * Admin Update Hero Slides
 * @route PUT /api/admin/site/hero-slides
 */
exports.updateHeroSlides = async (req, res) => {
  const parsed = heroSlidesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }
  await setSiteSettingJson("hero_slides", parsed.data);
  return res.json({ success: true, data: parsed.data });
};

/**
 * Admin Add Hero Slide
 * @route POST /api/admin/site/hero-slides
 */
exports.addHeroSlide = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Missing photo" });
    }

    const durationSeconds = Number(req.body?.durationSeconds ?? 5);
    if (
      !Number.isFinite(durationSeconds) ||
      durationSeconds < 1 ||
      durationSeconds > 600
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid duration" });
    }

    const current = await getSiteSettingJson(
      "hero_slides",
      DEFAULT_HERO_SLIDES
    );
    const parsed = heroSlidesSchema.safeParse(current);
    const safe = parsed.success ? parsed.data : DEFAULT_HERO_SLIDES;

    const slide = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : crypto.randomBytes(16).toString("hex"),
      url: `/uploads/${req.file.filename}`,
      durationMs: Math.round(durationSeconds * 1000),
    };

    const next = { slides: [...(safe.slides || []), slide] };
    const validated = heroSlidesSchema.safeParse(next);

    if (!validated.success) {
      return res
        .status(400)
        .json({ success: false, message: "Too many slides" });
    }

    await setSiteSettingJson("hero_slides", validated.data);
    return res.json({ success: true, data: validated.data });
  } catch (err) {
    console.error("Hero slides add error:", err);
    return res.status(500).json({ success: false, message: "Create failed" });
  }
};

/**
 * Admin Delete Hero Slide
 * @route DELETE /api/admin/site/hero-slides/:id
 */
exports.deleteHeroSlide = async (req, res) => {
  const id = String(req.params.id || "").trim();
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  const current = await getSiteSettingJson("hero_slides", DEFAULT_HERO_SLIDES);
  const parsed = heroSlidesSchema.safeParse(current);
  const safe = parsed.success ? parsed.data : DEFAULT_HERO_SLIDES;
  const next = { slides: (safe.slides || []).filter((s) => s.id !== id) };

  await setSiteSettingJson("hero_slides", next);
  return res.json({ success: true, data: next });
};
