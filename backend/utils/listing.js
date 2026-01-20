const crypto = require("crypto");
const { slugify, normalizeCategoryValue } = require("./helpers");

function buildListingPayload(data, userId, files, existing) {
  const images = files?.map((f) => f.filename) || [];
  const tags = data.tags
    ? JSON.stringify(data.tags)
    : existing?.tags || JSON.stringify([]);
  const slugBase = data.slug || data.title || existing?.title || "listing";
  const safeSlug = slugify(slugBase);

  const toDateOrUndefined = (value) => {
    if (!value) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  return {
    userId,
    title: data.title ?? existing?.title,
    slug: existing?.slug || safeSlug,
    category: normalizeCategoryValue(
      data.category ?? existing?.category ?? "Poulet"
    ),
    wilaya: data.wilaya ?? existing?.wilaya,
    commune: data.commune ?? existing?.commune,
    details: data.details ?? existing?.details,
    description: data.description ?? existing?.description,
    status:
      data.status ?? data.statusOverride ?? existing?.status ?? "published",
    preparationDate:
      toDateOrUndefined(data.preparationDate) ?? existing?.preparationDate,
    vaccinated:
      typeof data.vaccinated === "boolean"
        ? data.vaccinated
        : existing?.vaccinated,
    pricePerKg: data.pricePerKg ?? existing?.pricePerKg,
    unit: data.unit ?? existing?.unit ?? "kg",
    contactPhone: data.contactPhone ?? existing?.contactPhone,
    contactEmail: data.contactEmail ?? existing?.contactEmail,
    photo: images[0] ? `/uploads/${images[0]}` : existing?.photo || null,
    coverImage: existing?.coverImage || null,
    images: images.length ? JSON.stringify(images) : existing?.images,
    tags,
    views: data.views ?? existing?.views ?? 0,
    favorites: data.favorites ?? existing?.favorites ?? 0,
    publishedAt:
      data.status === "published" || data.statusOverride === "published"
        ? existing?.publishedAt || new Date()
        : existing?.publishedAt || null,
  };
}

async function recordUserPhoto({ userId, file, source, referenceId }) {
  const { prisma } = require("../config/database");
  // Limit removed: Infinite photos allowed
  return prisma.userPhoto.create({
    data: {
      userId,
      path: `/uploads/${file.filename}`,
      originalName: file.originalname,
      source: source || "manual",
      referenceId: referenceId ? String(referenceId) : null,
    },
  });
}

function serializeUserPhoto(photoInstance) {
  const obj = photoInstance?.toJSON ? photoInstance.toJSON() : photoInstance;
  if (!obj) return null;
  const { ensureAbsoluteUrl } = require("./helpers");
  return {
    ...obj,
    url: ensureAbsoluteUrl(
      obj.path.startsWith("/uploads/") ? obj.path : `/uploads/${obj.path}`
    ),
  };
}

module.exports = {
  buildListingPayload,
  recordUserPhoto,
  serializeUserPhoto,
};
