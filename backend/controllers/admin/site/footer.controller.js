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

async function setSiteSettingJson(key, value) {
  const payload = JSON.stringify(value);
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: payload },
    update: { value: payload },
  });
}

/**
 * Admin Get Footer
 * @route GET /api/admin/site/footer
 */
exports.getFooter = async (_req, res) => {
  const data = await getSiteSettingJson("footer", DEFAULT_FOOTER);
  const parsed = footerSchema.safeParse(data);
  const normalized = parsed.success
    ? { ...DEFAULT_FOOTER, ...parsed.data }
    : DEFAULT_FOOTER;
  return res.json({ success: true, data: { footer: normalized } });
};

/**
 * Admin Update Footer
 * @route PUT /api/admin/site/footer
 */
exports.updateFooter = async (req, res) => {
  const incoming = req.body?.footer ?? req.body;
  const parsed = footerSchema.safeParse(incoming);

  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  const normalized = { ...DEFAULT_FOOTER, ...parsed.data };
  await setSiteSettingJson("footer", normalized);
  return res.json({ success: true, data: { footer: normalized } });
};
