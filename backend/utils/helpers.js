const crypto = require("crypto");
const path = require("path");
const { prisma } = require("../config/database");

const fs = require("fs");

const rawApiOrigin =
  process.env.APP_ORIGIN ||
  process.env.SERVER_ORIGIN ||
  process.env.FRONTEND_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

const API_ORIGIN =
  String(rawApiOrigin).trim().replace(/\/$/, "") ||
  `http://localhost:${process.env.PORT || 5000}`;

function normalizeEmail(value) {
  return value ? value.trim().toLowerCase() : "";
}

function normalizeUsername(value) {
  return value ? value.trim().toLowerCase() : "";
}

function isEmail(value) {
  return isDeliverableEmailFormat(value);
}

const DEFAULT_DISPOSABLE_EMAIL_DOMAINS = [
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "disposablemail.com",
  "dropmail.me",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "guerrillamail.com",
  "mailinator.com",
  "minuteinbox.com",
  "mohmal.com",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "temp-mail.org",
  "trashmail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
];

function getDisposableDomains() {
  const extra = String(process.env.DISPOSABLE_EMAIL_DOMAINS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_DISPOSABLE_EMAIL_DOMAINS, ...extra]);
}

function parseEmailDomain(email) {
  const normalized = normalizeEmail(email);
  const idx = normalized.lastIndexOf("@");
  if (idx === -1) return "";
  return normalized.slice(idx + 1);
}

function isDeliverableEmailFormat(email) {
  const value = normalizeEmail(email);
  if (!value) return false;
  if (value.length > 254) return false;

  const ok =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
      value
    );
  if (!ok) return false;

  const domain = parseEmailDomain(value);
  const parts = domain.split(".").filter(Boolean);
  const tld = parts[parts.length - 1] || "";
  if (tld.length < 2 || tld.length > 24) return false;
  return true;
}

function isDisposableEmail(email) {
  const domain = parseEmailDomain(email);
  if (!domain) return false;
  const set = getDisposableDomains();
  if (set.has(domain)) return true;
  const parts = domain.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join(".");
    if (set.has(candidate)) return true;
  }
  return false;
}

function slugify(text) {
  return (text || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function makeUniqueSlug(baseSlug) {
  const base = slugify(baseSlug || "listing");
  let candidate = base;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.order.findFirst({ where: { slug: candidate } });
    if (!exists) return candidate;
    candidate = `${base}-${crypto.randomInt(1000, 10000)}`;
  }
  return `${base}-${Date.now()}-${crypto.randomInt(1000, 10000)}`;
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function sanitizeUser(userInstance) {
  if (!userInstance) return null;
  const user = userInstance?.toJSON
    ? userInstance.toJSON()
    : { ...userInstance };
  delete user.passwordHash;
  delete user.otp;
  delete user.otpExpires;
  delete user.otpHash;
  delete user.otpExpiresAt;
  delete user.emailVerifyTokenHash;
  delete user.emailVerifyTokenExpiresAt;
  return user;
}

function ensureAbsoluteUrl(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const path = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed.replace(/^\/+/, "")}`;
  return `${API_ORIGIN}${path}`;
}

function sanitizeUploadedFilename(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return "";
  }
  return trimmed.replace(/^\/uploads\//, "").replace(/^\/+/, "");
}

function serializeListing(orderInstance) {
  const obj = orderInstance?.toJSON ? orderInstance.toJSON() : orderInstance;
  if (!obj) return null;

  let images = [];
  if (obj.images) {
    try {
      images = JSON.parse(obj.images) || [];
    } catch {
      images = [];
    }
  } else if (obj.photo) {
    const filename = String(obj.photo).replace(/^\/uploads\//, "");
    images = filename ? [filename] : [];
  }

  const sanitizedImages = images
    .map((img) => sanitizeUploadedFilename(img))
    .filter(Boolean);
  const fallbackPhotoFilename = sanitizeUploadedFilename(obj.photo);
  const resolvedImageNames =
    sanitizedImages.length > 0
      ? sanitizedImages
      : fallbackPhotoFilename
      ? [fallbackPhotoFilename]
      : [];
  const resolvedImageUrls = resolvedImageNames
    .map((name) => `/uploads/${name}`)
    .filter(Boolean);
  const fallbackPhotoUrl = obj.photo || null;
  if (!resolvedImageUrls.length && fallbackPhotoUrl) {
    resolvedImageUrls.push(fallbackPhotoUrl);
  }
  const photoUrl = resolvedImageUrls[0] || fallbackPhotoUrl || null;
  const coverImageUrl = obj.coverImage || null;
  images = resolvedImageNames.map((name) => `/uploads/${name}`);

  let tags = [];
  if (obj.tags) {
    try {
      tags = JSON.parse(obj.tags) || [];
    } catch {
      tags = [];
    }
  }

  const user = obj.User || obj.user || null;
  const farmer = user
    ? {
        name: user.fullName || user.username || "User",
        location: user.wilaya || "",
      }
    : undefined;

  return {
    ...obj,
    images,
    imageUrls: resolvedImageUrls,
    photoUrl,
    coverImageUrl,
    tags,
    ...(farmer ? { farmer } : {}),
  };
}

function normalizeCategoryValue(category) {
  const raw = String(category ?? "").trim();
  if (!raw) return raw;
  const lower = raw.toLowerCase();
  if (
    lower === "œufs" ||
    lower === "oeufs" ||
    lower === "oeuf" ||
    lower === "œuf"
  ) {
    return "Oeufs";
  }
  return raw;
}

/**
 * Robustly deletes a file if it exists.
 * Does not throw if the file is missing or locked.
 */
function safeUnlink(filePath) {
  if (!filePath) return;
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(
          __dirname,
          "..",
          filePath.startsWith("/") ? "" : "/",
          filePath
        );

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    // Silently ignore deletion errors (locked files, permissions, etc.)
  }
}

module.exports = {
  normalizeEmail,
  normalizeUsername,
  isEmail,
  isDeliverableEmailFormat,
  isDisposableEmail,
  slugify,
  makeUniqueSlug,
  generateOtp,
  sanitizeUser,
  ensureAbsoluteUrl,
  sanitizeUploadedFilename,
  serializeListing,
  normalizeCategoryValue,
  safeUnlink,
  asyncHandler: (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next),
  API_ORIGIN,
};
