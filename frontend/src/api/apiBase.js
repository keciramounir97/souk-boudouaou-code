export function ensureApiBaseUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return "/api";
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  if (/\/api$/i.test(withoutTrailingSlash)) return withoutTrailingSlash;
  return `${withoutTrailingSlash}/api`;
}

export function normalizeEndpointPath(path, { throwOnApiPrefix = false } = {}) {
  if (path == null) return path;
  if (typeof path !== "string") return path;
  const trimmed = path.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  let normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  normalized = normalized.replace(/\/{2,}/g, "/");

  if (normalized === "/api") {
    if (throwOnApiPrefix) {
      throw new Error(
        `Endpoint path must not be '/api' when baseURL already includes '/api'`
      );
    }
    return "/";
  }

  if (normalized.startsWith("/api/")) {
    if (throwOnApiPrefix) {
      throw new Error(
        `Endpoint path must not start with '/api/' when baseURL already includes '/api': ${normalized}`
      );
    }
    normalized = normalized.replace(/^\/api/, "");
    if (!normalized) normalized = "/";
  }

  return normalized;
}

