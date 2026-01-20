import api from "./api";
import { normalizeEndpointPath } from "./apiBase";
import userMockFile from "../mocks/user.json";
import ordersMockFile from "../mocks/orders.json";
import mockAdminUsers from "../mocks/adminUsers.json";
import mockAuditClicks from "../mocks/auditClicks.json";
import listingsMockFile from "../mocks/listings.json";
import myListingsMockFile from "../mocks/myListings.json";

// Get API origin from environment variable (without /api suffix)
// This is used for image URLs and other direct backend URLs
export const API_ORIGIN = (import.meta.env.VITE_API_URL || "")
  .replace(/\/api$/, "")
  .replace(/\/+$/, "");
const ENV_MOCK = import.meta.env.VITE_USE_MOCK === "1";
const ENV_MOCK_LISTINGS = import.meta.env.VITE_USE_MOCK_LISTINGS === "1";
const ENV_MOCK_USERS = import.meta.env.VITE_USE_MOCK_USERS === "1";
const THROW_ON_API_PREFIX = import.meta.env.DEV;

function apiPath(path) {
  return normalizeEndpointPath(path, { throwOnApiPrefix: THROW_ON_API_PREFIX });
}

export function isMockEnabled() {
  try {
    const stored = localStorage.getItem("use_mock");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // ignore
  }
  return ENV_MOCK;
}

export function setMockEnabled(enabled) {
  try {
    localStorage.setItem("use_mock", enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

export function isMockListingsEnabled() {
  try {
    const stored = localStorage.getItem("use_mock_listings");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // ignore
  }
  return ENV_MOCK_LISTINGS || isMockEnabled();
}

export function setMockListingsEnabled(enabled) {
  try {
    localStorage.setItem("use_mock_listings", enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

export function isMockUsersEnabled() {
  try {
    const stored = localStorage.getItem("use_mock_users");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // ignore
  }
  return ENV_MOCK_USERS || isMockEnabled();
}

export function setMockUsersEnabled(enabled) {
  try {
    localStorage.setItem("use_mock_users", enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

export function clearMockCaches() {
  try {
    localStorage.removeItem("mock_orders");
    localStorage.removeItem("mock_admin_users");
    localStorage.removeItem("mock_inquiries");
    localStorage.removeItem("mock_listings");
    localStorage.removeItem("mock_my_listings");
  } catch {
    // ignore
  }
}

let MOCK_USER = structuredClone(userMockFile.user);

function defaultListingImage(category) {
  const normalized = String(category || "").toLowerCase();

  // Use specific static placeholders or a reliable service
  // Unsplash source is deprecated/unreliable
  if (normalized.includes("oeuf"))
    return "https://loremflickr.com/800/600/eggs,food/all";
  if (normalized.includes("poussin") || normalized.includes("chick"))
    return "https://loremflickr.com/800/600/chick,baby-chicken/all";
  if (normalized.includes("dinde") || normalized.includes("turkey"))
    return "https://loremflickr.com/800/600/turkey,bird/all";

  // Default Chicken
  return "https://loremflickr.com/800/600/chicken,poultry/all";
}

function loadMockListings() {
  const stored = localStorage.getItem("mock_listings");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.data?.listings) {
        parsed.data.listings = parsed.data.listings.map((l, idx) => ({
          id: l.id || l._id || `mock-${idx + 1}`,
          ...l,
        }));
      }
      return parsed;
    } catch {
      // ignore
    }
  }
  const cloned = structuredClone(listingsMockFile);
  if (cloned?.data?.listings) {
    cloned.data.listings = cloned.data.listings.map((l, idx) => ({
      id: l.id || l._id || `mock-${idx + 1}`,
      ...l,
    }));
  }
  return cloned;
}

function saveMockListings(listings) {
  const payload = { success: true, data: { listings } };
  localStorage.setItem("mock_listings", JSON.stringify(payload));
  return payload;
}

function loadMockMyListings() {
  const stored = localStorage.getItem("mock_my_listings");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return structuredClone(myListingsMockFile);
}

function saveMockMyListings(listings) {
  const payload = { success: true, data: listings };
  localStorage.setItem("mock_my_listings", JSON.stringify(payload));
  return payload;
}

/* =========================
   Listings (mock supported)
   ========================= */

export async function getListings(params) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.max(1, Number(params?.limit || 20));
    const start = (page - 1) * limit;
    const slice = listings.slice(start, start + limit);
    return {
      success: true,
      data: {
        listings: slice,
        pagination: {
          page,
          limit,
          total: listings.length,
          totalPages: Math.max(1, Math.ceil(listings.length / limit)),
          hasNext: start + limit < listings.length,
          hasPrev: page > 1,
        },
      },
    };
  }
  try {
    const res = await api.get(apiPath("/listings"), { params });
    return res.data;
  } catch (e) {
    // Return empty array structure instead of error to prevent app crash
    return {
      success: true,
      data: {
        listings: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    };
  }
}

export async function getListingDetails(id) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const target = listings.find(
      (l) => String(l.id || l._id || l.slug) === String(id || "")
    );
    if (!target) return { success: false, message: "Not found" };
    return { success: true, data: { listing: target } };
  }
  try {
    const res = await api.get(apiPath(`/public/listings/${id}`));
    return res.data;
  } catch (e) {
    console.error("getListingDetails error:", e);
    return {
      success: false,
      message:
        e?.response?.data?.message || e?.message || "Failed to fetch listing",
    };
  }
}

export async function getMyListings() {
  if (isMockListingsEnabled()) {
    const base = loadMockMyListings();
    return { success: true, data: base?.data || [] };
  }
  try {
    const res = await api.get(apiPath("/user/my-listings"));
    return res.data;
  } catch (e) {
    console.error("getMyListings error:", e);
    return {
      success: false,
      message:
        e?.response?.data?.message || e?.message || "Failed to fetch listings",
    };
  }
}

export async function createListing(fd) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const entries = Object.fromEntries(fd.entries());
    const category = entries.category || "Poulet";
    const id = `mock-${Date.now()}`;
    const listing = {
      id,
      _id: id,
      title: entries.title || "Annonce",
      description: entries.description || entries.details || "",
      price: Number(entries.pricePerKg || entries.price || 0) || 0,
      pricePerKg: Number(entries.pricePerKg || entries.price || 0) || 0,
      unit: entries.unit || "kg",
      createdAt: new Date().toISOString(),
      status: entries.status || "published",
      category,
      wilaya: entries.wilaya || "",
      commune: entries.commune || "",
      listingDate: entries.listingDate || "",
      breedingDate: entries.breedingDate || "",
      preparationDate: entries.preparationDate || "",
      trainingType: entries.trainingType || "",
      medicationsUsed: entries.medicationsUsed || "",
      vaccinated: entries.vaccinated === "true" || entries.vaccinated === true,
      images: [defaultListingImage(category)],
      views: 0,
    };
    const next = [listing, ...listings];
    saveMockListings(next);
    const myBase = loadMockMyListings();
    const myNext = [{ _id: id, title: listing.title }, ...(myBase?.data || [])];
    saveMockMyListings(myNext);
    return { success: true, data: { listing } };
  }
  const res = await api.post(apiPath("/listings"), fd);
  return res.data;
}

export async function updateListing(id, fd) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const idx = listings.findIndex((l) => String(l.id || l._id) === String(id));
    if (idx === -1) return { success: false, message: "Not found" };
    const entries = Object.fromEntries(fd.entries());
    const next = { ...listings[idx] };
    if (entries.title) next.title = entries.title;
    if (entries.description || entries.details) {
      next.description = entries.description || entries.details;
    }
    if (entries.category) next.category = entries.category;
    if (entries.wilaya) next.wilaya = entries.wilaya;
    if (entries.commune) next.commune = entries.commune;
    if (entries.pricePerKg || entries.price) {
      const price = Number(entries.pricePerKg || entries.price || 0) || 0;
      next.price = price;
      next.pricePerKg = price;
    }
    if (entries.unit) next.unit = entries.unit;
    if (entries.status) next.status = entries.status;
    if (entries.listingDate) next.listingDate = entries.listingDate;
    if (entries.breedingDate) next.breedingDate = entries.breedingDate;
    if (entries.preparationDate) next.preparationDate = entries.preparationDate;
    if (entries.trainingType) next.trainingType = entries.trainingType;
    if (entries.medicationsUsed) next.medicationsUsed = entries.medicationsUsed;
    if (entries.vaccinated !== undefined) {
      next.vaccinated =
        entries.vaccinated === "true" || entries.vaccinated === true;
    }
    listings[idx] = next;
    saveMockListings(listings);
    return { success: true, data: { listing: next } };
  }
  const res = await api.put(apiPath(`/listings/${id}`), fd);
  return res.data;
}

export async function deleteListing(id) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const next = listings.filter((l) => String(l.id || l._id) !== String(id));
    saveMockListings(next);
    const myBase = loadMockMyListings();
    const myNext = (myBase?.data || []).filter(
      (l) => String(l.id || l._id) !== String(id)
    );
    saveMockMyListings(myNext);
    return { success: true };
  }
  const res = await api.delete(apiPath(`/listings/${id}`));
  return res.data;
}

export async function searchListings(q) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const term = String(q || "").toLowerCase();
    const filtered = term
      ? listings.filter((l) => {
          const title = String(l.title || "").toLowerCase();
          const desc = String(l.description || "").toLowerCase();
          return title.includes(term) || desc.includes(term);
        })
      : listings;
    return { success: true, data: { listings: filtered } };
  }
  const res = await api.get(apiPath("/listings/search"), { params: { q } });
  return res.data;
}

export async function setListingStatus(id, status) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const idx = listings.findIndex((l) => String(l.id || l._id) === String(id));
    if (idx === -1) return { success: false, message: "Not found" };
    listings[idx] = { ...listings[idx], status };
    saveMockListings(listings);
    return { success: true, data: { listing: listings[idx] } };
  }
  const res = await api.patch(apiPath(`/listings/${id}/status`), { status });
  return res.data;
}

/* =========================
   Profile
   ========================= */

export async function getProfile() {
  try {
    const res = await api.get(apiPath("/dashboard/user"));
    return res.data;
  } catch (e) {
    console.error("getProfile error:", e);
    const saved = localStorage.getItem("user");
    if (saved) return { success: true, user: JSON.parse(saved) };
    if (isMockEnabled()) return { success: true, user: MOCK_USER };
    return { success: false };
  }
}

export async function updateProfile(body) {
  if (!isMockEnabled()) {
    try {
      const res = await api.put(apiPath("/auth/update"), body);
      return res.data;
    } catch (e) {
      console.error("updateProfile error:", e);
      return {
        success: false,
        message:
          e?.response?.data?.message ||
          e?.message ||
          "Update failed. Please try again.",
      };
    }
  }
  MOCK_USER = { ...MOCK_USER, ...body };
  return { success: true, user: MOCK_USER };
}

/* =========================
   Inquiries
   ========================= */

export async function createInquiry(slugOrId, body) {
  if (!isMockEnabled()) {
    const res = await api.post(
      apiPath(`/public/listings/${slugOrId}/inquiries`),
      body
    );
    return res.data;
  }
  const stored = localStorage.getItem("mock_inquiries");
  const all = stored ? JSON.parse(stored) : [];
  const inquiry = {
    id: `iq${Date.now()}`,
    listingId: String(slugOrId),
    userId: MOCK_USER?.id || null,
    name: body?.name || MOCK_USER?.fullName || MOCK_USER?.username || "",
    email: body?.email || MOCK_USER?.email || "",
    phone: body?.phone || MOCK_USER?.phone || "",
    message: body?.message || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER || null,
    listing: null,
  };
  all.unshift(inquiry);
  localStorage.setItem("mock_inquiries", JSON.stringify(all));
  return { success: true, data: { inquiry } };
}

export async function adminGetInquiries(params) {
  if (!isMockEnabled()) {
    const res = await api.get(apiPath("/admin/inquiries"), { params });
    return res.data;
  }
  const stored = localStorage.getItem("mock_inquiries");
  const all = stored ? JSON.parse(stored) : [];
  return {
    success: true,
    data: {
      inquiries: all.slice(0, params?.limit || 50),
      total: all.length,
      page: 1,
      limit: params?.limit || 50,
    },
  };
}

/* =========================
   Orders (mock-supported)
   ========================= */

export async function getOrders() {
  if (!isMockEnabled()) {
    try {
      const res = await api.get(apiPath("/orders"));
      return res.data;
    } catch (e) {
      console.error("getOrders error:", e);
    }
  }
  return ordersMockFile;
}

export async function getUserOrders() {
  if (!isMockEnabled()) {
    try {
      const res = await api.get(apiPath("/user/orders"));
      return res.data;
    } catch (e) {
      console.error("getUserOrders error:", e);
    }
  }
  return ordersMockFile;
}

/* =========================
   Admin (listings/users)
   ========================= */

export async function getAdminListings(params) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    return {
      success: true,
      data: {
        listings,
        total: listings.length,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    };
  }
  const res = await api.get(apiPath("/admin/listings"), { params });
  return res.data;
}

export async function adminSetListingStatus(id, status) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const idx = listings.findIndex((l) => String(l.id || l._id) === String(id));
    if (idx === -1) return { success: false, message: "Not found" };
    listings[idx] = { ...listings[idx], status };
    saveMockListings(listings);
    return { success: true, data: { listing: listings[idx] } };
  }
  const res = await api.patch(apiPath(`/admin/listings/${id}/status`), {
    status,
  });
  return res.data;
}

export async function getAdminUsers(params) {
  if (!isMockUsersEnabled()) {
    const res = await api.get(apiPath("/admin/users"), { params });
    return res.data;
  }
  const stored = localStorage.getItem("mock_admin_users");
  if (stored) return JSON.parse(stored);
  return mockAdminUsers;
}

export async function adminCreateUser(body) {
  if (!isMockUsersEnabled()) {
    const res = await api.post(apiPath("/admin/users"), body);
    return res.data;
  }
  const stored = localStorage.getItem("mock_admin_users");
  const base = stored ? JSON.parse(stored) : mockAdminUsers;
  const users = base?.data?.users || [];
  const nextId = users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0) + 1;
  const user = {
    id: nextId,
    email: body.email,
    username: body.username || `user${nextId}`,
    fullName: body.fullName || "",
    role: body.role || "user",
    isActive: body.isActive !== false,
    verified: body.verified === true,
    createdAt: new Date().toISOString(),
    password: body.password,
  };
  const next = {
    ...base,
    data: { ...(base.data || {}), users: [user, ...users] },
  };
  localStorage.setItem("mock_admin_users", JSON.stringify(next));
  return { success: true, data: { user } };
}

export async function adminUpdateUser(id, body) {
  if (!isMockUsersEnabled()) {
    const res = await api.patch(apiPath(`/admin/users/${id}`), body);
    return res.data;
  }
  const stored = localStorage.getItem("mock_admin_users");
  const base = stored ? JSON.parse(stored) : mockAdminUsers;
  const users = base?.data?.users || [];
  const idx = users.findIndex((u) => Number(u.id) === Number(id));
  if (idx === -1) return { success: false, message: "Not found" };
  users[idx] = { ...users[idx], ...body };
  const next = { ...base, data: { ...(base.data || {}), users } };
  localStorage.setItem("mock_admin_users", JSON.stringify(next));
  return { success: true, data: { user: users[idx] } };
}

export async function adminDeleteUser(id) {
  if (!isMockUsersEnabled()) {
    const res = await api.delete(apiPath(`/admin/users/${id}`));
    return res.data;
  }
  const stored = localStorage.getItem("mock_admin_users");
  const base = stored ? JSON.parse(stored) : mockAdminUsers;
  const users = base?.data?.users || [];
  const nextUsers = users.filter((u) => Number(u.id) !== Number(id));
  const next = { ...base, data: { ...(base.data || {}), users: nextUsers } };
  localStorage.setItem("mock_admin_users", JSON.stringify(next));
  return { success: true };
}

/* =========================
   Site settings
   ========================= */

export const DEFAULT_MOVING_HEADER_FONT_CONFIG = {
  fontFamily: "Inter",
  fontSize: 15,
  fontWeight: "600",
  fontStyle: "normal",
  letterSpacing: 0.28,
  wordSpacing: 0.35,
};

export async function getMovingHeaderSettings() {
  try {
    const res = await api.get(apiPath("/public/site/moving-header"));
    return res.data;
  } catch (err) {
    // Silently fallback to default
    return {
      success: true,
      data: { items: [], fontConfig: DEFAULT_MOVING_HEADER_FONT_CONFIG },
    };
  }
}

export async function getAdminMovingHeaderSettings() {
  try {
    const res = await api.get(apiPath("/admin/site/moving-header"));
    return res.data;
  } catch {
    return {
      success: true,
      data: { items: [], fontConfig: DEFAULT_MOVING_HEADER_FONT_CONFIG },
    };
  }
}

export async function updateMovingHeaderSettings(payload) {
  const res = await api.put(apiPath("/admin/site/moving-header"), payload);
  return res.data;
}

const HERO_KEY = "site_hero_slides_v1";

function loadLocalHeroSlides() {
  try {
    const raw = localStorage.getItem(HERO_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { data: { slides: [] } };
}

function saveLocalHeroSlides(payload) {
  try {
    localStorage.setItem(HERO_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
  return payload;
}

export async function getHeroSlides() {
  try {
    const res = await api.get(apiPath("/public/site/hero-slides"));
    return res.data;
  } catch (err) {
    // Silently fallback to local slides
    return loadLocalHeroSlides();
  }
}

export async function adminGetHeroSlides() {
  try {
    const res = await api.get(apiPath("/admin/site/hero-slides"));
    return res.data;
  } catch {
    return loadLocalHeroSlides();
  }
}

export async function adminAddHeroSlide({ file, durationSeconds }) {
  const fd = new FormData();
  fd.append("photo", file);
  fd.append("durationSeconds", String(durationSeconds ?? 5));
  try {
    const res = await api.post(apiPath("/admin/site/hero-slides"), fd);
    return res.data;
  } catch {
    const base = loadLocalHeroSlides();
    const slides = base?.data?.slides || [];
    const url = URL.createObjectURL(file);
    const next = {
      id: `hero-${Date.now()}`,
      url,
      durationSeconds: durationSeconds ?? 5,
    };
    const payload = { success: true, data: { slides: [...slides, next] } };
    return saveLocalHeroSlides(payload);
  }
}

export async function adminUpdateHeroSlides(payload) {
  try {
    const res = await api.put(apiPath("/admin/site/hero-slides"), payload);
    return res.data;
  } catch {
    const base = loadLocalHeroSlides();
    const slides = payload?.slides || payload?.data?.slides || [];
    const next = { success: true, data: { slides } };
    return saveLocalHeroSlides(next);
  }
}

export async function adminDeleteHeroSlide(id) {
  try {
    const res = await api.delete(apiPath(`/admin/site/hero-slides/${id}`));
    return res.data;
  } catch {
    const base = loadLocalHeroSlides();
    const slides = (base?.data?.slides || []).filter(
      (s) => String(s.id || s._id) !== String(id)
    );
    const next = { success: true, data: { slides } };
    return saveLocalHeroSlides(next);
  }
}

/* =========================
   CTA settings (fallback local)
   ========================= */
const CTA_KEY = "site_cta_settings_v1";
const defaultCta = {
  imageUrl: "",
  titleFr: "Rejoignez le Souk",
  titleAr: "انضم إلى السوق",
  subtitleFr: "Publiez vos lots, le centre d'appel gere les contacts.",
  subtitleAr: "انشر منتجاتك وندير مكالمات المهتمين.",
  buttonFr: "Poster une annonce",
  buttonAr: "انشر منشور",
  link: "/create-listing",
};

const FOOTER_KEY = "site_footer_settings_v1";
const defaultFooter = {
  aboutFr:
    "Marche agricole digital, appui par centre d appel, et categories avec icones claires pour naviguer vite.",
  aboutAr: "سوق رقمي للمنتجات الفلاحية مع مركز نداء وتصفح سريع بالايقونات.",
  callCenters: ["+213 791 948 070", "+213 561 234 567", "+213 550 987 654"],
  columns: [
    {
      titleFr: "Navigation",
      titleAr: "روابط",
      links: [
        { labelFr: "Favoris", labelAr: "المحفوظات", href: "/saved" },
        { labelFr: "Parametres", labelAr: "الإعدادات", href: "/settings" },
        { labelFr: "Admin", labelAr: "الادارة", href: "/admin" },
      ],
    },
  ],
};

function loadLocalCta() {
  try {
    const raw = localStorage.getItem(CTA_KEY);
    if (raw) return { ...defaultCta, ...(JSON.parse(raw) || {}) };
  } catch {
    // ignore
  }
  return { ...defaultCta };
}

function saveLocalCta(payload) {
  try {
    localStorage.setItem(CTA_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export async function getCtaSettings() {
  try {
    const res = await api.get(apiPath("/public/site/cta"));
    return res.data;
  } catch (err) {
    // Suppress 404 errors - these are expected if endpoint doesn't exist
    if (err?.response?.status !== 404) {
      console.error("getCtaSettings error:", err);
    }
    return { success: true, data: { cta: loadLocalCta() } };
  }
}

export async function adminGetCtaSettings() {
  try {
    const res = await api.get(apiPath("/admin/site/cta"));
    return res.data;
  } catch {
    return { success: true, data: { cta: loadLocalCta() } };
  }
}

export async function adminUpdateCtaSettings(payload) {
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;
  try {
    const res = await api.put(
      apiPath("/admin/site/cta"),
      payload,
      isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined
    );
    return res.data;
  } catch (e) {
    if (isFormData) throw e;
    const next = { ...loadLocalCta(), ...(payload?.cta || payload || {}) };
    saveLocalCta(next);
    return { success: true, data: { cta: next } };
  }
}

function loadLocalFooter() {
  try {
    const raw = localStorage.getItem(FOOTER_KEY);
    if (raw) return { ...defaultFooter, ...(JSON.parse(raw) || {}) };
  } catch {
    // ignore
  }
  return { ...defaultFooter };
}

function saveLocalFooter(payload) {
  try {
    localStorage.setItem(FOOTER_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export async function getFooterSettings() {
  try {
    const res = await api.get(apiPath("/public/site/footer"));
    return res.data;
  } catch (err) {
    // Silently fallback to local footer
    return { success: true, data: { footer: loadLocalFooter() } };
  }
}

export async function adminGetFooterSettings() {
  try {
    const res = await api.get(apiPath("/admin/site/footer"));
    return res.data;
  } catch {
    return { success: true, data: { footer: loadLocalFooter() } };
  }
}

export async function adminUpdateFooterSettings(payload) {
  try {
    const res = await api.put(apiPath("/admin/site/footer"), payload);
    return res.data;
  } catch {
    const next = {
      ...loadLocalFooter(),
      ...(payload?.footer || payload || {}),
    };
    saveLocalFooter(next);
    return { success: true, data: { footer: next } };
  }
}

/* =========================
   Logo settings
   ========================= */
const LOGO_KEY = "site_logo_settings_v1";
const defaultLogo = {
  logoLight: "",
  logoDark: "",
};

function loadLocalLogo() {
  try {
    const raw = localStorage.getItem(LOGO_KEY);
    if (raw) return { ...defaultLogo, ...(JSON.parse(raw) || {}) };
  } catch {
    // ignore
  }
  return { ...defaultLogo };
}

function saveLocalLogo(payload) {
  try {
    localStorage.setItem(LOGO_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export async function getLogoSettings() {
  try {
    const res = await api.get(apiPath("/public/site/logo"));
    return res.data;
  } catch (err) {
    // Silently fallback to local logo - don't spam console
    return { success: true, data: { logo: loadLocalLogo() } };
  }
}

export async function adminGetLogoSettings() {
  try {
    const res = await api.get(apiPath("/admin/site/logo"));
    return res.data;
  } catch {
    return { success: true, data: { logo: loadLocalLogo() } };
  }
}

export async function adminUpdateLogoSettings(formData) {
  try {
    const res = await api.put(apiPath("/admin/site/logo"), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch {
    const current = loadLocalLogo();
    const next = { ...current };
    // Note: Can't save files to localStorage, so this is just for structure
    saveLocalLogo(next);
    return { success: true, data: { logo: next } };
  }
}

/* =========================
   Audit
   ========================= */

export async function getAuditClicks(params) {
  if (!isMockEnabled()) {
    const res = await api.get(apiPath("/admin/audit/clicks"), { params });
    return res.data;
  }
  return mockAuditClicks;
}
