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

async function setSiteSettingJson(key, value) {
  const payload = JSON.stringify(value);
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: payload },
    update: { value: payload },
  });
}

/**
 * Admin Get Logo
 * @route GET /api/admin/site/logo
 */
exports.getLogo = async (_req, res) => {
  const data = await getSiteSettingJson("logo", DEFAULT_LOGO);
  const parsed = logoSchema.safeParse(data);
  const normalized = parsed.success
    ? { ...DEFAULT_LOGO, ...parsed.data }
    : DEFAULT_LOGO;
  return res.json({ success: true, data: { logo: normalized } });
};

/**
 * Admin Update Logo
 * @route PUT /api/admin/site/logo
 */
exports.updateLogo = async (req, res) => {
  try {
    const incoming = req.body?.logo ?? req.body;
    const parsed = logoSchema.safeParse(incoming);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const normalized = { ...DEFAULT_LOGO, ...parsed.data };
    
    // Handle file uploads
    if (req.files) {
      if (req.files.logoLight && req.files.logoLight[0]) {
        normalized.logoLight = `/uploads/${req.files.logoLight[0].filename}`;
      }
      if (req.files.logoDark && req.files.logoDark[0]) {
        normalized.logoDark = `/uploads/${req.files.logoDark[0].filename}`;
      }
    }
    
    // Handle single file uploads (if only one file is sent)
    if (req.file) {
      // Determine which logo based on field name or default to light
      const fieldName = req.body?.logoType || "logoLight";
      normalized[fieldName] = `/uploads/${req.file.filename}`;
    }

    await setSiteSettingJson("logo", normalized);
    return res.json({ success: true, data: { logo: normalized } });
  } catch (err) {
    console.error("Logo update error:", err);
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};
