import { API_ORIGIN } from "../api/dataService";

export function normalizeCategoryValue(category) {
  // Gracefully handle category objects {fr,en,ar}
  if (category && typeof category === "object") {
    category =
      category.fr ||
      category.en ||
      category.ar ||
      Object.values(category)[0] ||
      "";
  }
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

export function normalizeImageUrl(img) {
  const raw = String(img || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("/uploads/")) return `${API_ORIGIN}${raw}`;
  return `${API_ORIGIN}/uploads/${raw.replace(/^\/+/, "")}`;
}
