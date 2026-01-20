import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tag as TagIcon } from "akar-icons";
import { Clock } from "lucide-react";
import { useTheme } from "../context/themeContext";
import { useTranslation } from "../context/translationContext";
import Footer from "../components/Footer";
import SearchFilterBar from "../components/SearchFilterBar";
import {
  getHeroSlides,
  getListings,
  getFooterSettings,
  getLogoSettings,
} from "../api/dataService";
import { normalizeCategoryValue, normalizeImageUrl } from "../utils/images";
import { useCategoryOptions } from "../hooks/useCategoryOptions";
import Logo from "../components/Logo";
// Import asset images for fallbacks
import chickenImg from "../assets/chicken.png";
import chicken2Img from "../assets/chicken2.png";
import slideImg1 from "../assets/pexels-james-collington-2147687246-29771450.jpg";
import slideImg2 from "../assets/pexels-james-collington-2147687246-29771458.jpg";
import slideImg3 from "../assets/pexels-photocorp-20867250.jpg";

// Fallback images arrays
const SLIDE_FALLBACKS = [slideImg1, slideImg2, slideImg3];
const LISTING_FALLBACKS = [chickenImg, chicken2Img];

function getFallbackImage(category, index = 0, type = "listing") {
  if (type === "slide") {
    return SLIDE_FALLBACKS[index % SLIDE_FALLBACKS.length] || SLIDE_FALLBACKS[0];
  }
  return LISTING_FALLBACKS[index % LISTING_FALLBACKS.length] || LISTING_FALLBACKS[0];
}

function withAlpha(color, alpha) {
  const hex = String(color || "").trim();
  const a = Math.max(0, Math.min(1, Number(alpha)));
  if (!hex.startsWith("#") || Number.isNaN(a)) return color;
  const raw = hex.slice(1);
  const norm = (pair) =>
    parseInt(pair.length === 1 ? pair + pair : pair, 16) || 0;
  const r = norm(raw.slice(0, 2));
  const g = norm(raw.slice(2, 4));
  const b = norm(raw.slice(4, 6));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function svgPlaceholder({ label, accent, darkMode }) {
  const bg = darkMode ? "#0b0b0f" : "#f5f8ff";
  const fg = darkMode ? "#e2e8f0" : "#1f2937";
  const safe = String(label || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="${bg}"/>
      <circle cx="520" cy="90" r="120" fill="${
        accent || "#4285f4"
      }" fill-opacity="${darkMode ? 0.18 : 0.14}"/>
      <circle cx="120" cy="340" r="180" fill="${
        accent || "#4285f4"
      }" fill-opacity="${darkMode ? 0.12 : 0.1}"/>
      <text x="40" y="230" font-family="Inter, system-ui" font-size="38" font-weight="700" fill="${fg}">${safe}</text>
      <text x="40" y="270" font-family="Inter, system-ui" font-size="18" fill="${fg}" fill-opacity="${
    darkMode ? 0.7 : 0.6
  }">Photo</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function flattenText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(flattenText).join(" ");
  if (typeof value === "object")
    return Object.values(value).map(flattenText).join(" ");
  return "";
}

const SAVED_LISTINGS_KEY = "saved_listings_v1";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const { t, language } = useTranslation();
  const {
    options: categories,
    accentFor,
    labelFor,
    hasValue,
  } = useCategoryOptions();
  
  const [savedListingIds, setSavedListingIds] = useState(new Set());

  const pageX = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
  const defaultFooter = {
    aboutFr:
      "Marche agricole digital, appui par centre d appel, et categories avec icones claires pour naviguer vite.",
    aboutAr: "??? ???? ???????? ???????? ?? ???? ???? ????? ???? ??????????.",
    callCenters: ["+213 791 948 070", "+213 561 234 567", "+213 550 987 654"],
    columns: [
      {
        titleFr: "Navigation",
        titleAr: "?????",
        links: [
          { labelFr: "Favoris", labelAr: "?????????", href: "/saved" },
          { labelFr: "Parametres", labelAr: "?????????", href: "/settings" },
          { labelFr: "Admin", labelAr: "???????", href: "/admin" },
        ],
      },
    ],
  };

  const [activeCategory, setActiveCategory] = useState("Poulet");
  const [query, setQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(150);
  const [footerConfig, setFooterConfig] = useState(null);
  const [logoConfig, setLogoConfig] = useState(null);
  const [filterWilaya, setFilterWilaya] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [filterMed, setFilterMed] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [orderBy, setOrderBy] = useState("newest"); // Default: newest first
  const [orderOpen, setOrderOpen] = useState(false);

  // Load saved listings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_LISTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : [];
        const ids = new Set(list.map(item => String(item.id || item._id)));
        setSavedListingIds(ids);
      }
    } catch {
      setSavedListingIds(new Set());
    }
  }, []);

  // Toggle save listing
  const toggleSaveListing = useCallback((listing) => {
    try {
      const raw = localStorage.getItem(SAVED_LISTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const listingId = String(listing.id || listing._id);
      
      const entry = {
        id: listing.id || listing._id,
        title: listing.title?.[language] || listing.title?.fr || listing.title,
        category: listing.category,
        price: listing.price,
        wilaya: listing.wilaya || listing.location,
        images: listing.images || [],
        image: listing.images?.[0],
        savedAt: Date.now(),
      };

      if (savedListingIds.has(listingId)) {
        const next = list.filter(item => String(item.id || item._id) !== listingId);
        localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(next));
        setSavedListingIds(prev => {
          const nextSet = new Set(prev);
          nextSet.delete(listingId);
          return nextSet;
        });
      } else {
        const next = [entry, ...list].slice(0, 50);
        localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(next));
        setSavedListingIds(prev => new Set([...prev, listingId]));
      }
    } catch (error) {
      console.error("Error saving listing:", error);
    }
  }, [savedListingIds, language]);

  const activeAccent = useMemo(
    () => accentFor(activeCategory),
    [accentFor, activeCategory]
  );

  const orderOptions = useMemo(
    () => [
      {
        key: "newest",
        label:
          t("orderNewest") || (language === "ar" ? "الأحدث" : "Plus récent"),
      },
      {
        key: "oldest",
        label:
          t("orderOldest") || (language === "ar" ? "الأقدم" : "Plus ancien"),
      },
      {
        key: "price-asc",
        label:
          t("orderPriceAsc") ||
          (language === "ar" ? "السعر تصاعدي" : "Prix croissant"),
      },
      {
        key: "price-desc",
        label:
          t("orderPriceDesc") ||
          (language === "ar" ? "السعر تنازلي" : "Prix décroissant"),
      },
    ],
    [language, t]
  );

  const currentOrderLabel =
    orderOptions.find((o) => o.key === orderBy)?.label || orderOptions[0].label;

  const searchPlaceholder =
    t("searchPlaceholder") ||
    (language === "ar" ? "ابحث في العروض" : "Filtrer les annonces");
  const filtersButtonLabel =
    t("filters") || (language === "ar" ? "الفلاتر" : "Filtres");
  const searchButtonLabel =
    t("searchAction") || (language === "ar" ? "ابحث" : "Rechercher");
  const orderActionLabel =
    t("orderAction") ||
    (language === "ar" ? "تخصيص الترتيب" : "Filtrer l'ordre");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      const normalized = normalizeCategoryValue(categoryParam);
      if (normalized && normalizeCategoryValue(activeCategory) !== normalized) {
        setActiveCategory(normalized);
      }
    } else if (categories.length > 0 && !hasValue(activeCategory)) {
      const firstCategory = normalizeCategoryValue(categories[0].value);
      setActiveCategory(firstCategory);
      navigate(`/?category=${encodeURIComponent(firstCategory)}`, { replace: true });
    }
  }, [categories, hasValue, location.search, navigate, activeCategory]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--category-accent", activeAccent);
    root.style.setProperty(
      "--category-accent-soft",
      withAlpha(activeAccent, darkMode ? 0.22 : 0.16)
    );
  }, [activeAccent, darkMode]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [slidesJson, listingsJson] = await Promise.all([
          getHeroSlides().catch(() => ({
            data: { slides: [], isVisible: true },
          })),
          getListings().catch(() => ({ data: { listings: [] } })),
        ]);
        if (!alive) return;

        // HERO SLIDES
        const slidesData = slidesJson?.data || slidesJson || {};
        const slideArr = Array.isArray(slidesData.slides)
          ? slidesData.slides
          : Array.isArray(slidesData)
          ? slidesData
          : [];

        // Check visibility (default true)
        const isHeroVisible =
          slidesData.isVisible !== undefined ? slidesData.isVisible : true;

        if (!isHeroVisible) {
          setHeroSlides([]); // Empty array = hidden capability
        } else {
          setHeroSlides(
            slideArr.map((s) => {
              const durationMs =
                Number(s?.durationMs || s?.duration) ||
                (Number(s?.durationSeconds)
                  ? Math.round(Number(s.durationSeconds) * 1000)
                  : 0) ||
                5000;
              // Normalize URL if it's from backend, otherwise use as-is (for asset imports)
              let finalUrl = null;
              if (s?.url) {
                const urlStr = String(s.url);
                // If it's a data URL or already a full URL, use as-is
                // If it starts with http/https, use as-is
                // If it's an asset import (contains /assets/ or starts with /src/), use as-is
                if (urlStr.startsWith('data:') || 
                    urlStr.startsWith('http://') || 
                    urlStr.startsWith('https://') ||
                    urlStr.includes('/assets/') ||
                    urlStr.startsWith('/src/')) {
                  finalUrl = urlStr;
                } else {
                  // Normalize backend URLs
                  finalUrl = normalizeImageUrl(urlStr);
                }
              }
              // Use fallback if no URL
              if (!finalUrl) {
                finalUrl = getFallbackImage(null, idx, "slide");
              }
              return {
                ...s,
                id: s?.id || s?.url || Math.random().toString(36).slice(2),
                url: finalUrl,
                durationMs,
              };
            })
          );
        }

        // LISTINGS - Ensure it's always an array
        let listingsArr = [];
        if (listingsJson) {
          if (Array.isArray(listingsJson)) {
            listingsArr = listingsJson;
          } else if (Array.isArray(listingsJson.data?.listings)) {
            listingsArr = listingsJson.data.listings;
          } else if (Array.isArray(listingsJson.listings)) {
            listingsArr = listingsJson.listings;
          } else if (Array.isArray(listingsJson.data)) {
            listingsArr = listingsJson.data;
          }
        }
        
        setAllListings(
          listingsArr.map((l) => {
            const imgs = Array.isArray(l.images)
              ? l.images
              : Array.isArray(l.photo)
              ? l.photo
              : l.photo
              ? [l.photo]
              : [];
            return {
              ...l,
              id: l.id || l._id || Math.random().toString(36).slice(2),
              category: normalizeCategoryValue(l.category) || "",
              images: imgs.map(normalizeImageUrl).filter(Boolean),
            };
          })
        );
      } catch (e) {
        console.error("Home fetch error", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);


  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const json = await getFooterSettings();
        const footer = json?.data?.footer || json?.footer || defaultFooter;
        // Check visibility (future proofing)
        const isVisible =
          footer.isVisible !== undefined ? footer.isVisible : true;

        if (active) {
          if (!isVisible) setFooterConfig(null);
          else setFooterConfig({ ...defaultFooter, ...footer });
        }
      } catch {
        if (active) setFooterConfig(defaultFooter);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const json = await getLogoSettings();
        const logo = json?.data?.logo || json?.logo || { logoLight: "", logoDark: "" };
        if (active) setLogoConfig(logo);
      } catch {
        if (active) setLogoConfig({ logoLight: "", logoDark: "" });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fallbackHeroSlides = useMemo(
    () => [
      {
        id: "fallback-1",
        url: null,
        durationMs: 5200,
        background: darkMode
          ? "linear-gradient(120deg, rgba(0,0,0,0.85), rgba(66,133,244,0.35))"
          : "linear-gradient(120deg, rgba(66,133,244,0.28), rgba(251,188,5,0.22))",
      },
      {
        id: "fallback-2",
        url: null,
        durationMs: 5200,
        background: darkMode
          ? "linear-gradient(120deg, rgba(0,0,0,0.82), rgba(255,139,0,0.32))"
          : "linear-gradient(120deg, rgba(255,139,0,0.26), rgba(66,133,244,0.25))",
      },
    ],
    [darkMode]
  );

  const heroSlidesForRender = useMemo(() => {
    const valid = (heroSlides || []).filter((s) => s.url);
    return valid.length ? valid : fallbackHeroSlides;
  }, [heroSlides, fallbackHeroSlides]);

  const slideTimeoutRef = useRef(null);
  useEffect(() => {
    if (!heroSlidesForRender.length) return undefined;
    if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
    const idx = currentSlide % heroSlidesForRender.length;
    const duration =
      heroSlidesForRender[idx]?.durationMs ||
      heroSlidesForRender[idx]?.duration ||
      5000;
    slideTimeoutRef.current = setTimeout(
      () => setCurrentSlide((c) => (c + 1) % heroSlidesForRender.length),
      duration
    );
    return () => {
      if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
    };
  }, [currentSlide, heroSlidesForRender]);

  const applyFilters = useMemo(() => {
    const startFilter = dateStart ? new Date(dateStart) : null;
    const endFilter = dateEnd ? new Date(dateEnd) : null;
    const hasStartFilter =
      startFilter instanceof Date && !Number.isNaN(startFilter);
    const hasEndFilter = endFilter instanceof Date && !Number.isNaN(endFilter);

    const filtered = (allListings || []).filter((l) => {
      const sameCategory =
        normalizeCategoryValue(l.category) ===
        normalizeCategoryValue(activeCategory);
      if (!sameCategory) return false;

      const wilayaValue = (l.wilaya || l.location || "")
        .toString()
        .toLowerCase();
      if (filterWilaya && !wilayaValue.includes(filterWilaya.toLowerCase())) {
        return false;
      }

      const priceVal = Number(l.price || 0);
      if (priceMin !== "" && priceVal < Number(priceMin)) return false;
      if (priceMax !== "" && priceVal > Number(priceMax)) return false;

      const startVal =
        l.cycleStart ||
        l.cycle_start ||
        l.cycleStartDate ||
        l.startDate ||
        l.createdAt;
      const endVal =
        l.cycleEnd || l.cycle_end || l.cycleEndDate || l.endDate || l.updatedAt;
      const listingStart = startVal ? new Date(startVal) : null;
      const listingEnd = endVal ? new Date(endVal) : null;

      if (hasStartFilter) {
        if (
          !(listingStart instanceof Date) ||
          Number.isNaN(+listingStart) ||
          listingStart < startFilter
        ) {
          return false;
        }
      }
      if (hasEndFilter) {
        if (
          !(listingEnd instanceof Date) ||
          Number.isNaN(+listingEnd) ||
          listingEnd > endFilter
        ) {
          return false;
        }
      }

      if (filterMed) {
        const medField =
          l.medicaments ||
          l.medications ||
          l.medicineUsed ||
          l.medicament ||
          "";
        const medText =
          typeof medField === "string"
            ? medField
            : medField?.[language] || medField?.fr || medField?.ar || "";
        if (
          !medText.toString().toLowerCase().includes(filterMed.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });

    const filteredByQuery = query
      ? filtered.filter((l) => {
          const title = l.title?.[language] || l.title?.fr || l.title || "";
          const desc =
            l.description?.[language] ||
            l.description?.fr ||
            l.description ||
            "";
          const farmer = l.farmer?.name || "";
          const detailText = [
            l.details,
            l.detail,
            l.longDescription,
            l.summary,
            l.features,
            l.descriptionExtra,
            l.highlights,
            l.body,
          ]
            .map(flattenText)
            .join(" ");
          const combined = [
            title,
            desc,
            farmer,
            detailText,
            l.wilaya,
            l.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          const q = query.toLowerCase();
          return combined.includes(q);
        })
      : filtered;

    const listingDate = (l) => {
      const candidate =
        l.createdAt ||
        l.updatedAt ||
        l.cycleEnd ||
        l.cycle_end ||
        l.cycleStart ||
        l.cycle_start ||
        l.startDate ||
        l.endDate;
      const d = candidate ? new Date(candidate) : null;
      const ts = d instanceof Date && !Number.isNaN(+d) ? +d : 0;
      return ts;
    };
    const priceValue = (l) => Number(l.price || 0);

    const sorted = [...filteredByQuery].sort((a, b) => {
      switch (orderBy) {
        case "oldest":
          return listingDate(a) - listingDate(b);
        case "price-asc":
          return priceValue(a) - priceValue(b);
        case "price-desc":
          return priceValue(b) - priceValue(a);
        case "newest":
        default:
          return listingDate(b) - listingDate(a);
      }
    });

    return sorted;
  }, [
    allListings,
    activeCategory,
    query,
    language,
    filterWilaya,
    priceMin,
    priceMax,
    dateStart,
    dateEnd,
    filterMed,
    orderBy,
  ]);

  const visibleListings = useMemo(
    () => applyFilters.slice(0, visibleCount),
    [applyFilters, visibleCount]
  );

  const formatPrice = useCallback(
    (price) => new Intl.NumberFormat("fr-FR").format(Number(price || 0)),
    []
  );

  const formatUnit = useCallback(
    (unit) => {
      if (!unit) return t("kg") || (language === "ar" ? "كغ" : "kg");
      if (typeof unit === "string" && unit.toLowerCase() === "kg") {
        return t("kg") || (language === "ar" ? "كغ" : "kg");
      }
      return unit;
    },
    [language, t]
  );

  // Format relative time (e.g., "5 minutes ago")
  const formatRelativeTime = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (language === "ar") {
      if (diffMins < 1) return "الآن";
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      // If more than 1 day, show full date
      return date.toLocaleDateString("ar-DZ", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } else {
      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      // If more than 1 day, show full date
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  }, [language]);

  const currencyLabel = t("currency") || (language === "ar" ? "دج" : "DA");

  const categoryLabel = useCallback((value) => labelFor(value), [labelFor]);
  const safeLabel = useCallback(
    (val) => {
      if (val && typeof val === "object") {
        return val[language] || val.fr || val.ar || "";
      }
      return String(val || "");
    },
    [language]
  );

  const footerGradient = darkMode
    ? "linear-gradient(180deg, rgba(2,5,16,0.9), rgba(2,5,16,1))"
    : "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.95))";
  const footerTextColor = darkMode ? "#f8fafc" : "#0f172a";

  return (
    <div className="min-h-screen font-['Public_Sans'] bg-[var(--color-surface)] text-[var(--color-text)]">
      {/* HERO - Redesigned */}
      <div className="responsive-container pt-4 pb-6">
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)] h-[240px] sm:h-[320px] md:h-[400px]">
          {heroSlidesForRender.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: slide.url
                  ? `url(${slide.url})`
                  : slide.background || `url(${getFallbackImage(null, idx, "slide")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className={`absolute inset-0 ${
                  darkMode ? "bg-gradient-to-b from-black/70 via-black/50 to-black/70" : "bg-gradient-to-b from-slate-900/50 via-slate-900/40 to-slate-900/50"
                }`}
              />
            </div>
          ))}
          
          {/* Hero Content - Logo Only */}
          <div className="absolute inset-0 flex items-center justify-center text-center p-6 z-20 pointer-events-none">
            <Logo
              alt="Logo"
              className="h-20 sm:h-24 md:h-32 lg:h-40 mx-auto drop-shadow-2xl"
              forceDark={true}
              style={{
                filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))",
              }}
            />
          </div>

          {/* Slide Indicators */}
          {heroSlidesForRender.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
              {heroSlidesForRender.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="responsive-container mt-6">
        <SearchFilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder={searchPlaceholder}
          showFilters={showFilters}
          filtersLabel={filtersButtonLabel}
          orderActionLabel={orderActionLabel}
          searchLabel={searchButtonLabel}
          onToggleFilters={() => setShowFilters((v) => !v)}
          orderOptions={orderOptions}
          orderBy={orderBy}
          orderOpen={orderOpen}
          setOrderOpen={setOrderOpen}
          onOrderChange={setOrderBy}
          accent={activeAccent}
          language={language}
          orderLabel={currentOrderLabel}
          onSearch={() => {
            setShowFilters(false);
            setOrderOpen(false);
          }}
        />

        {showFilters ? (
          <div className="filters-panel space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold opacity-80">
                  {t("categoryFiltersTitle") ||
                    (language === "ar" ? "الفئات" : "Catégorie")}
                </label>
                <select
                  className="field"
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {safeLabel(categoryLabel(c.value))}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold opacity-80">
                  {t("wilaya") || (language === "ar" ? "الولاية" : "Wilaya")}
                </label>
                <input
                  type="text"
                  className="field"
                  placeholder={
                    t("wilayaPlaceholder") ||
                    (language === "ar" ? "اكتب الولاية" : "Tapez wilaya")
                  }
                  value={filterWilaya}
                  onChange={(e) => setFilterWilaya(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold opacity-80">
                  {t("priceMin") ||
                    (language === "ar"
                      ? "السعر الأدنى (دج/كغ)"
                      : "Prix min (DA/كغ)")}
                </label>
                <input
                  type="number"
                  className="field"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  min="0"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold opacity-80">
                  {t("priceMax") ||
                    (language === "ar"
                      ? "السعر الأقصى (دج/كغ)"
                      : "Prix max (DA/كغ)")}
                </label>
                <input
                  type="number"
                  className="field"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  min="0"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold opacity-80">
                  {t("cycleStart") ||
                    (language === "ar" ? "بداية الدورة" : "Date début cycle")}
                </label>
                <input
                  type="date"
                  className="field"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold opacity-80">
                  {t("cycleEnd") ||
                    (language === "ar" ? "نهاية الدورة" : "Date fin cycle")}
                </label>
                <input
                  type="date"
                  className="field"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold opacity-80">
                  {t("medicationsUsed") ||
                    (language === "ar"
                      ? "الأدوية المستعملة"
                      : "Médicaments utilisés")}
                </label>
                <input
                  type="text"
                  className="field"
                  placeholder={
                    t("medicationsPlaceholder") ||
                    (language === "ar" ? "اسم الدواء" : "Nom du médicament")
                  }
                  value={filterMed}
                  onChange={(e) => setFilterMed(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFilterWilaya("");
                  setPriceMin("");
                  setPriceMax("");
                  setDateStart("");
                  setDateEnd("");
                  setFilterMed("");
                }}
              >
                {t("resetFilters") ||
                  (language === "ar" ? "إعادة التعيين" : "Réinitialiser")}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* CATEGORIES - Professional Design */}
      <div className="responsive-container pt-10 pb-6">
        <div className="category-strip-shell">
          <div className="category-strip">
            {categories.map((c) => {
              const isActive =
                normalizeCategoryValue(c.value) === normalizeCategoryValue(activeCategory);
              const iconBg = isActive
                ? "rgba(255, 255, 255, 0.2)"
                : withAlpha(c.accent, darkMode ? 0.2 : 0.15);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    const normalizedValue = normalizeCategoryValue(c.value);
                    setActiveCategory(normalizedValue);
                    navigate(`/?category=${encodeURIComponent(normalizedValue)}`, { replace: true });
                  }}
                  className={`category-button group ${
                    isActive ? "category-active" : ""
                  }`}
                  style={{
                    "--category-color": c.accent,
                    "--category-color-alpha": withAlpha(c.accent, 0.1),
                  }}
                  aria-label={safeLabel(categoryLabel(c.value))}
                >
                  <div className="category-button-content">
                    {/* Icon Container */}
                    <div
                      className={`category-icon-wrapper ${
                        isActive ? "category-icon-active" : ""
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? iconBg
                          : withAlpha(c.accent, darkMode ? 0.25 : 0.2),
                        borderColor: isActive ? "transparent" : withAlpha(c.accent, 0.3),
                        borderWidth: isActive ? "0" : "2px",
                        borderStyle: "solid",
                      }}
                    >
                      {typeof c.iconUrl === "string" && c.iconUrl.trim() ? (
                        <img
                          src={c.iconUrl}
                          alt={safeLabel(categoryLabel(c.value))}
                          className="category-icon-img"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="category-icon-text">
                          {c.icon || safeLabel(c.value || "?").slice(0, 2)}
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    <span className={`category-label ${isActive ? "category-label-active" : ""}`}>
                      {safeLabel(categoryLabel(c.value))}
                    </span>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="category-indicator" style={{ backgroundColor: c.accent }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* LISTINGS */}
      <div className="responsive-container py-10">
        <div
          className="rounded-xl p-6 md:p-8 transition-all duration-500 border border-[var(--color-border)]"
          style={{
            backgroundColor: activeAccent,
            boxShadow: `0 10px 30px ${withAlpha(activeAccent, 0.3)}`,
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="h-8 w-1.5 rounded-full"
              style={{ backgroundColor: activeAccent }}
            />
          </div>
          {loading ? (
            <div className="opacity-70">{t("loading") || "Chargement..."}</div>
          ) : applyFilters.length === 0 ? (
            <div className="py-14 text-center">
              <div className="text-xl font-semibold">
                {t("noListingsTitle") || "Aucune annonce trouvee"}
              </div>
              <div className="opacity-70 mt-2">
                {t("noListingsSubtitle") ||
                  "Essayez une autre categorie ou ajustez vos filtres."}
              </div>
            </div>
          ) : (
            <>
              <div className="listing-grid">
                {visibleListings.map((l, index) => {
                  const itemAccent = accentFor(l.category);
                  const firstImg = normalizeImageUrl(l.images?.[0]);
                  // Use asset fallback if no image, then SVG placeholder as last resort
                  const hasImage = firstImg && firstImg.trim() !== "";
                  const assetFallback = getFallbackImage(l.category, index, "listing");
                  const fallbackImg = hasImage 
                    ? null 
                    : assetFallback || svgPlaceholder({
                        label: categoryLabel(l.category),
                        accent: itemAccent,
                        darkMode,
                      });
                  const createdAt = l.createdAt || l.updatedAt;
                  const formattedDate = createdAt
                    ? new Date(createdAt).toLocaleDateString(
                        language === "ar" ? "ar-DZ" : "fr-FR"
                      )
                    : "";
                  const relativeTime = formatRelativeTime(createdAt);
                  const tags = [
                    safeLabel(categoryLabel(l.category)),
                    l.unit,
                    l.status,
                  ]
                    .filter(Boolean)
                    .slice(0, 3);
                  // Information badges data
                  const infoBadges = [
                    { label: safeLabel(categoryLabel(l.category)), value: l.category },
                    { label: l.wilaya || l.location || t("wilaya") || "Wilaya", value: l.wilaya || l.location },
                    { label: formatUnit(l.unit), value: l.unit },
                    { label: l.status || t("status") || "Status", value: l.status },
                  ].filter(badge => badge.value);

                  return (
                    <div
                      key={l.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/listing/${l.id}`)}
                      className="listing-card group cursor-pointer"
                      style={{
                        borderLeft: `4px solid ${itemAccent}`,
                      }}
                    >
                      <div className="listing-card-body">
                        <div className="listing-row">
                          {/* LEFT SIDE - Text Content */}
                          <div className="listing-left">
                            {/* Title with category badge */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex-1">
                                <h3
                                  className="listing-title"
                                  style={{ color: itemAccent }}
                                >
                                  {l.title?.[language] ||
                                    l.title?.fr ||
                                    l.title}
                                </h3>
                              </div>
                              <span
                                className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded"
                                style={{
                                  backgroundColor: "#4c8df7",
                                  color: "#fff",
                                }}
                              >
                                {safeLabel(categoryLabel(l.category))}
                              </span>
                            </div>

                            {/* Information Badges - Category Color */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {infoBadges.map((badge, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="info-badge"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Can add filter functionality here
                                  }}
                                  style={{
                                    backgroundColor: itemAccent,
                                    color: "#fff",
                                    borderColor: itemAccent,
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.outline = "2px solid #4c8df7";
                                    e.currentTarget.style.outlineOffset = "2px";
                                  }}
                                  onBlur={(e) => {
                                    e.currentTarget.style.outline = "none";
                                  }}
                                >
                                  {badge.label}
                                </button>
                              ))}
                            </div>

                            {/* Save Button and Relative Time */}
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveListing(l);
                                }}
                                className={`save-listing-btn ${savedListingIds.has(String(l.id || l._id)) ? "saved" : ""}`}
                                style={{
                                  backgroundColor: savedListingIds.has(String(l.id || l._id)) 
                                    ? itemAccent 
                                    : "transparent",
                                  borderColor: itemAccent,
                                  color: savedListingIds.has(String(l.id || l._id)) 
                                    ? "#fff" 
                                    : itemAccent,
                                }}
                                title={savedListingIds.has(String(l.id || l._id)) 
                                  ? (t("saved") || "Enregistré") 
                                  : (t("saveListing") || "Sauvegarder")}
                              >
                                <TagIcon
                                  strokeWidth={2}
                                  size={16}
                                  className={savedListingIds.has(String(l.id || l._id)) ? "fill-current" : ""}
                                />
                                <span className="text-xs font-semibold">
                                  {savedListingIds.has(String(l.id || l._id)) 
                                    ? (t("saved") || "Enregistré") 
                                    : (t("save") || "Sauvegarder")}
                                </span>
                              </button>
                              {relativeTime && (
                                <div 
                                  className="relative-time-box"
                                  style={{
                                    backgroundColor: "#fff",
                                    borderColor: itemAccent,
                                    border: "1.5px solid",
                                    color: itemAccent,
                                    marginRight: "0.5rem",
                                  }}
                                >
                                  <Clock className="w-4 h-4" />
                                  <span>{relativeTime}</span>
                                </div>
                              )}
                            </div>

                            {/* Price - Aligned bottom with button */}
                            <div className="mt-auto flex items-end">
                              <div
                                className="listing-price"
                                style={{ borderLeftColor: "#4c8df7" }}
                              >
                                {formatPrice(l.price)} {currencyLabel}{" "}
                                <span className="text-sm font-normal opacity-70">
                                  / {formatUnit(l.unit)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT SIDE - Photo and Button */}
                          <div className="listing-right">
                            <div className="flex flex-col gap-3 h-full">
                              {/* Image */}
                              <div className="listing-image-wrapper flex-1">
                                {hasImage ? (
                                  <img
                                    src={firstImg}
                                    alt={
                                      l.title?.[language] ||
                                      l.title?.fr ||
                                      l.title ||
                                      "Listing image"
                                    }
                                    onError={(e) => {
                                      // Try asset fallback first, then SVG placeholder
                                      if (e.currentTarget.src !== assetFallback) {
                                        e.currentTarget.src = assetFallback;
                                      } else {
                                        e.currentTarget.src = svgPlaceholder({
                                          label: categoryLabel(l.category),
                                          accent: itemAccent,
                                          darkMode,
                                        });
                                      }
                                    }}
                                    loading="lazy"
                                    className="object-cover"
                                  />
                                ) : (
                                  <img
                                    src={fallbackImg}
                                    alt={
                                      l.title?.[language] ||
                                      l.title?.fr ||
                                      l.title ||
                                      "Listing image"
                                    }
                                    onError={(e) => {
                                      // If asset fallback fails, use SVG placeholder
                                      if (fallbackImg !== svgPlaceholder({
                                        label: categoryLabel(l.category),
                                        accent: itemAccent,
                                        darkMode,
                                      })) {
                                        e.currentTarget.src = svgPlaceholder({
                                          label: categoryLabel(l.category),
                                          accent: itemAccent,
                                          darkMode,
                                        });
                                      }
                                    }}
                                    loading="lazy"
                                    className="object-cover"
                                  />
                                )}
                              </div>

                              {/* Button - Aligned bottom with price */}
                              <div className="mt-auto flex items-end">
                                <button
                                  type="button"
                                  className="see-more-btn"
                                  style={{
                                    backgroundColor: itemAccent,
                                    borderRadius: "6px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/listing/${l.id}`);
                                  }}
                                >
                                  {t("interested") ||
                                    (language === "ar"
                                      ? "أنا مهتم"
                                      : "Je suis intéressé")}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {applyFilters.length > visibleListings.length && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    className="see-more-btn"
                    style={{ backgroundColor: activeAccent }}
                    onClick={() =>
                      setVisibleCount((prev) =>
                        Math.min(prev + 50, applyFilters.length)
                      )
                    }
                  >
                    {t("viewMore") ||
                      (language === "en"
                        ? "View More"
                        : language === "ar"
                        ? "شاهد المزيد"
                        : "Voir plus")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>


      {/* FOOTER */}
      <Footer />
    </div>
  );
}
