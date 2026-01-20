import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Share2,
  MapPin,
  ShieldCheck,
  Tag as TagIcon,
  Phone,
  ArrowLeft,
  Calendar,
  Package,
  Truck,
  Clock,
  Weight,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { getListingDetails, getListings, createInquiry } from "../api/dataService";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/translationContext";
import { useCategoryOptions } from "../hooks/useCategoryOptions";
import { normalizeCategoryValue, normalizeImageUrl } from "../utils/images";
import { useTheme } from "../context/themeContext";
// Import asset images for fallbacks
import chickenImg from "../assets/chicken.png";
import chicken2Img from "../assets/chicken2.png";

// Fallback images for listings
const LISTING_FALLBACKS = [chickenImg, chicken2Img];

function getFallbackImage(category, index = 0) {
  return LISTING_FALLBACKS[index % LISTING_FALLBACKS.length] || LISTING_FALLBACKS[0];
}

const DEFAULT_CALL_CENTER = [
  { label: "#1", phone: "+213791948070" },
  { label: "#2", phone: "+213791948071" },
  { label: "#3", phone: "+213791948072" },
];
const CALL_CENTER = { name: "Souk Boudouaou" };
const SAVED_KEY = "saved_listings_v1";

// SVG placeholder generator (same as homepage)
function svgPlaceholder({ label, accent, darkMode }) {
  const bg = darkMode ? "#0b0b0f" : "#f5f8ff";
  const fg = darkMode ? "#e2e8f0" : "#1f2937";
  const safe = String(label || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
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


function pickLocalized(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return (
      value?.[language] ||
      value?.fr ||
      value?.en ||
      value?.ar ||
      Object.values(value)[0] ||
      ""
    );
  }
  return String(value);
}

// Format relative time
function formatRelativeTime(dateString, language) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (language === "ar") {
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return date.toLocaleDateString("ar-DZ", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } else {
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

// Limit text to 200 words
function limitWords(text, maxWords = 200) {
  if (!text) return "";
  // Remove HTML tags for accurate word count
  const plainText = text.replace(/<[^>]*>/g, " ");
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length <= maxWords) return text;
  // Get the first maxWords words from original text (preserving HTML if any)
  const originalWords = text.trim().split(/\s+/);
  return originalWords.slice(0, maxWords).join(" ") + "...";
}

// Parse markdown-like and Word-like formatting (supports both formatted and unformatted text)
function parseFormattedText(text) {
  if (!text) return "";
  
  // If text doesn't contain any formatting markers, return as plain text with line breaks
  const hasFormatting = /[*#_[\]().-]/.test(text);
  if (!hasFormatting) {
    return text.split('\n').map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : '<br />').join('');
  }
  
  // Split by lines to process lists properly
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  let listItems = [];
  let listType = 'ul'; // 'ul' or 'ol'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line is a list item (markdown or word-style)
    const unorderedMatch = line.match(/^[-*•]\s+(.+)$/);
    const orderedMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
    
    if (unorderedMatch || orderedMatch) {
      const match = unorderedMatch || orderedMatch;
      const itemText = match[2] || match[1];
      
      if (!inList) {
        inList = true;
        listItems = [];
        listType = orderedMatch ? 'ol' : 'ul';
      } else if ((orderedMatch && listType === 'ul') || (unorderedMatch && listType === 'ol')) {
        // Close previous list and start new one
        result.push(`<${listType} class="list-disc list-inside space-y-1 my-2">${listItems.join('')}</${listType}>`);
        listItems = [];
        listType = orderedMatch ? 'ol' : 'ul';
      }
      
      // Process inline formatting in list item
      let formattedItem = itemText
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-[var(--color-surface-muted)] px-1 py-0.5 rounded text-xs">$1</code>');
      listItems.push(`<li>${formattedItem}</li>`);
    } else {
      // Close list if we were in one
      if (inList) {
        result.push(`<${listType} class="list-disc list-inside space-y-1 my-2">${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = false;
      }
      
      // Process regular line with formatting
      if (line) {
        // Headers (markdown style)
        if (line.startsWith('### ')) {
          result.push(`<h3 class="text-lg font-bold mt-4 mb-2">${escapeHtml(line.substring(4))}</h3>`);
        } else if (line.startsWith('## ')) {
          result.push(`<h2 class="text-xl font-bold mt-4 mb-2">${escapeHtml(line.substring(3))}</h2>`);
        } else if (line.startsWith('# ')) {
          result.push(`<h1 class="text-2xl font-bold mt-4 mb-2">${escapeHtml(line.substring(2))}</h1>`);
        } else {
          // Regular paragraph with inline formatting
          let formattedLine = line
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.+?)__/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/_(.+?)_/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="bg-[var(--color-surface-muted)] px-1 py-0.5 rounded text-xs">$1</code>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[var(--category-accent)] underline" target="_blank" rel="noopener noreferrer">$1</a>');
          result.push(`<p class="mb-2">${formattedLine}</p>`);
        }
      } else {
        result.push('<br />');
      }
    }
  }
  
  // Close any remaining list
  if (inList && listItems.length > 0) {
    result.push(`<${listType} class="list-disc list-inside space-y-1 my-2">${listItems.join('')}</${listType}>`);
  }

  return result.join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Import icon library
import { getIconByName } from "../utils/iconLibrary";

// Icon mapping for custom fields (fallback for common fields)
const iconMap = {
  delivery: Truck,
  livraison: Truck,
  age: Clock,
  âge: Clock,
  weight: Weight,
  poids: Weight,
  quantity: Package,
  quantité: Package,
  users: Users,
  utilisateurs: Users,
  vaccinated: ShieldCheck,
  vacciné: ShieldCheck,
  available: CheckCircle,
  disponible: CheckCircle,
  unavailable: XCircle,
  indisponible: XCircle,
  default: Package,
};

// Get icon for a field name (uses icon library if iconName is provided)
function getIconForField(fieldName, iconName) {
  if (iconName) {
    const iconData = getIconByName(iconName);
    if (iconData && iconData.component) {
      return iconData.component;
    }
  }
  const normalized = String(fieldName || "").toLowerCase().trim();
  const Icon = iconMap[normalized] || iconMap.default;
  return Icon;
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { darkMode } = useTheme();
  const { accentFor, labelFor } = useCategoryOptions({ includeHidden: true });

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [similar, setSimilar] = useState([]);
  const [showNumbers, setShowNumbers] = useState(false);
  const [callNumbers, setCallNumbers] = useState(DEFAULT_CALL_CENTER);
  const [isSaved, setIsSaved] = useState(false);
  const [requestingCall, setRequestingCall] = useState(false);
  const [similarPage, setSimilarPage] = useState(1);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [hasMoreSimilar, setHasMoreSimilar] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const json = await getListingDetails(id);
        const item = json?.data?.listing || json?.listing || json?.data || null;
        if (!active) return;
        setListing(item);
        setActiveImg(0);

        // Load first page of similar listings
        try {
          const all = await getListings();
          const src = Array.isArray(all.data)
            ? all.data
            : all.data?.listings || [];
          const category = item?.category || "Poulet";
          const filtered = (src || [])
            .map((l) => {
              // Normalize images like in home.jsx
              const imgs = Array.isArray(l.images)
                ? l.images
                : Array.isArray(l.photo)
                ? l.photo
                : l.photo
                ? [l.photo]
                : [];
              return {
                ...l,
                images: imgs.map(normalizeImageUrl).filter(Boolean),
              };
            })
            .filter(
              (x) =>
                normalizeCategoryValue(x.category || "Poulet") ===
                normalizeCategoryValue(category)
            )
            .filter(
              (x) => String(x.id || x._id) !== String(item?.id || item?._id)
            );
          
          const pageSize = 20;
          const firstPage = filtered.slice(0, pageSize);
          if (active) {
            setSimilar(firstPage);
            setHasMoreSimilar(filtered.length > pageSize);
          }
        } catch {
          if (active) setSimilar([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Load more similar listings (pagination)
  const loadMoreSimilar = async () => {
    if (similarLoading || !hasMoreSimilar || !listing) return;
    
    setSimilarLoading(true);
    try {
      const all = await getListings();
      const src = Array.isArray(all.data)
        ? all.data
        : all.data?.listings || [];
      const category = listing?.category || "Poulet";
      const filtered = (src || [])
        .filter(
          (x) =>
            normalizeCategoryValue(x.category || "Poulet") ===
            normalizeCategoryValue(category)
        )
        .filter(
          (x) => String(x.id || x._id) !== String(listing?.id || listing?._id)
        );
      
      const pageSize = 20;
      const nextPage = similarPage + 1;
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const nextPageItems = filtered.slice(startIndex, endIndex);
      
      if (nextPageItems.length > 0) {
        setSimilar((prev) => [...prev, ...nextPageItems]);
        setSimilarPage(nextPage);
        setHasMoreSimilar(endIndex < filtered.length);
      } else {
        setHasMoreSimilar(false);
      }
    } catch {
      // ignore error
    } finally {
      setSimilarLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (!raw) return setIsSaved(false);
      const list = JSON.parse(raw);
      const exists = Array.isArray(list)
        ? list.some((item) => String(item.id || item._id) === String(id))
        : false;
      setIsSaved(exists);
    } catch {
      setIsSaved(false);
    }
  }, [id]);

  const listingUserId =
    listing?.userId || listing?.createdBy || listing?.ownerId;
  const isOwner = !!user?.id && String(user.id) === String(listingUserId);

  // Use backend images with asset fallbacks (like in home.jsx)
  const images = useMemo(() => {
    if (!listing) return [];
    // Handle both images array and photo field (like in home.jsx)
    const imgs = Array.isArray(listing.images)
      ? listing.images
      : Array.isArray(listing.photo)
      ? listing.photo
      : listing.photo
      ? [listing.photo]
      : [];
    const normalized = imgs.map(normalizeImageUrl).filter(Boolean);
    return normalized;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.images, listing?.photo]);

  const title =
    pickLocalized(listing?.title, language) || t("listing") || "Annonce";
  const category =
    pickLocalized(listing?.category, language) || listing?.category || "Poulet";
  const categoryLabel = labelFor(listing?.category || category);
  const wilaya = pickLocalized(listing?.wilaya, language) || t("wilaya") || "";
  const views = Number(listing?.views || 0);
  const price = listing?.pricePerKg ?? listing?.price ?? null;
  const unit = listing?.unit || "kg";
  const fullDescription =
    pickLocalized(listing?.description, language) ||
    pickLocalized(listing?.details, language) ||
    "";
  const description = limitWords(fullDescription, 200);
  const accent = accentFor(category);
  const createdAt = listing?.createdAt || listing?.updatedAt;

  // Extract custom/additional information fields
  const customFields = useMemo(() => {
    const fields = [];
    const listingData = listing || {};
    
    // Category field
    fields.push({
      key: "category",
      label: t("category") || "Catégorie",
      value: categoryLabel,
      icon: Package,
    });
    
    // Wilaya field
    if (wilaya) {
      fields.push({
        key: "wilaya",
        label: t("wilaya") || "Wilaya",
        value: wilaya,
        icon: MapPin,
      });
    }
    
    // Vaccinated field
    if (listingData.vaccinated !== undefined) {
      fields.push({
        key: "vaccinated",
        label: t("vaccinated") || "Vacciné",
        value: listingData.vaccinated ? "Oui" : "Non",
        icon: ShieldCheck,
      });
    }
    
    // Published date field - "Publié il y a x temps"
    if (createdAt) {
      const publishedTime = formatRelativeTime(createdAt, language);
      if (publishedTime) {
        // formatRelativeTime already returns "Il y a X min" or "منذ X دقيقة", so we prepend "Publié" for French
        const displayValue = language === "ar" 
          ? publishedTime // Arabic already has "منذ" prefix
          : publishedTime.startsWith("Il y a") || publishedTime.startsWith("À l'instant")
            ? `Publié ${publishedTime.toLowerCase()}`
            : `Publié le ${publishedTime}`;
        
        fields.push({
          key: "published",
          label: t("published") || "Publié",
          value: displayValue,
          icon: Clock,
        });
      }
    }
    
    // Breeding date field
    if (listingData.breedingDate) {
      fields.push({
        key: "breedingDate",
        label: t("cycleStart") || "Début du cycle",
        value: new Date(listingData.breedingDate).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR"),
        icon: Calendar,
      });
    }
    
    // Preparation date field
    if (listingData.preparationDate) {
      fields.push({
        key: "preparationDate",
        label: t("preparationDate") || "Date de préparation",
        value: new Date(listingData.preparationDate).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR"),
        icon: Calendar,
      });
    }
    
    // Standard fields that can be displayed with icons
    if (listingData.delivery !== undefined) {
      fields.push({
        key: "delivery",
        label: t("delivery") || "Livraison",
        value: listingData.delivery ? (t("yes") || "Oui") : (t("no") || "Non"),
        icon: Truck,
      });
    }
    if (listingData.age || listingData.âge) {
      fields.push({
        key: "age",
        label: t("age") || "Âge",
        value: listingData.age || listingData.âge,
        icon: Clock,
      });
    }
    if (listingData.weight || listingData.poids || listingData.averageWeight) {
      fields.push({
        key: "weight",
        label: t("weight") || "Poids",
        value: `${listingData.weight || listingData.poids || listingData.averageWeight} ${listingData.unit || "kg"}`,
        icon: Weight,
      });
    }
    if (listingData.quantity) {
      fields.push({
        key: "quantity",
        label: t("quantity") || "Quantité",
        value: listingData.quantity,
        icon: Package,
      });
    }
    
    // Custom fields from additionalInfo or customFields
    if (listingData.additionalInfo && typeof listingData.additionalInfo === "object") {
      Object.entries(listingData.additionalInfo).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          fields.push({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: String(value),
            icon: getIconForField(key),
          });
        }
      });
    }
    
    if (listingData.customFields && Array.isArray(listingData.customFields)) {
      listingData.customFields.forEach((field) => {
        if (field && field.key && field.value) {
          fields.push({
            key: field.key,
            label: field.label || field.key,
            value: String(field.value),
            icon: getIconForField(field.key, field.iconName || field.icon),
          });
        }
      });
    }

    return fields;
  }, [listing, t, categoryLabel, wilaya, language, createdAt]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("call_center_numbers");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setCallNumbers(parsed);
        }
      }
    } catch {
      setCallNumbers(DEFAULT_CALL_CENTER);
    }
  }, []);


  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert(t("copied") || "Copied.");
      }
    } catch {
      // ignore
    }
  };

  const toggleSave = () => {
    if (!listing) return;
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const currentId = String(listing.id || listing._id || id);
      const entry = {
        id: listing.id || listing._id || id,
        title,
        category,
        price: listing.price,
        wilaya,
        images,
        image: images?.[0],
        savedAt: Date.now(),
      };

      if (list.some((item) => String(item.id || item._id) === currentId)) {
        const next = list.filter(
          (item) => String(item.id || item._id) !== currentId
        );
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        setIsSaved(false);
      } else {
        const next = [entry, ...list].slice(0, 50);
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        setIsSaved(true);
      }
    } catch {
      // ignore
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat("fr-FR").format(Number(price));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-muted)]">
        <div className="animate-spin w-10 h-10 rounded-full border-b-2 border-[var(--category-accent)]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-2xl font-semibold mb-3">
          {t("notFound") || "Introuvable"}
        </div>
        <div className="text-sm opacity-70 mb-4">
          {t("listingNotFoundHint") ||
            "Cette annonce n'existe pas ou a été supprimée."}
        </div>
        <button className="btn-secondary" onClick={() => navigate("/")}>
          {t("home") || "Accueil"}
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)]"
      style={{ "--category-accent": accent }}
    >
      {/* Header with Back Button */}
      <div className="responsive-container pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t("back") || "Retour"}</span>
        </button>
      </div>

      <div className="responsive-container pb-8">
        {/* Main Content - Two Column Layout: Left (Title/Call) | Right (Image matching height) */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 mb-8">
          {/* LEFT COLUMN - Title and Call sections */}
          <div className="space-y-6 flex flex-col min-h-[500px] lg:min-h-[600px] w-fit">
            {/* Title, Price and Actions */}
            <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm flex-shrink-0 w-full min-w-[280px]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold text-white mb-3" style={{ backgroundColor: accent }}>
                    {categoryLabel}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {wilaya || t("wilaya")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {views} {t("views") || "vues"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleSave}
                    className={`p-2 rounded-lg border transition-all ${
                      isSaved
                        ? "text-white"
                        : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                    }`}
                    style={{
                      backgroundColor: isSaved ? accent : "transparent",
                    }}
                    title={isSaved ? t("saved") || "Enregistré" : t("saveListing") || "Sauvegarder"}
                  >
                    <TagIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-all"
                    title={t("share") || "Partager"}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              {price && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="text-4xl font-bold" style={{ color: accent }}>
                    {formatPrice(price)} <span className="text-lg font-semibold text-[var(--color-text-muted)]">DA</span>
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">
                    / {unit}
                  </div>
                </div>
              )}
            </div>

            {/* Call Section - Simplified Contact Card */}
            <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm flex-1 flex flex-col overflow-hidden max-w-[520px] mx-auto w-full" style={{ borderColor: `${accent}30` }}>
              {/* Header with gradient background */}
              <div className="px-5 py-4" style={{ background: `linear-gradient(135deg, ${accent}15 0%, ${accent}08 100%)` }}>
                <div className="flex items-center justify-center gap-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-md" style={{ backgroundColor: accent }}>
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-[var(--color-text)]">{CALL_CENTER.name}</div>
                    <div className="text-xs font-medium" style={{ color: accent }}>
                      {t("callCenterTitle") || "Centre d'appel"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Who We Are Section */}
              <div className="px-5 py-3 border-b border-[var(--color-border)]">
                <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
                  <h3 className="text-xs font-bold text-[var(--color-text)] mb-1.5">
                    {t("whoWeAre") || "Qui sommes-nous ?"}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {t("whoWeAreDescription") || "Souk Boudouaou est l'intermédiaire entre vous et le fermier. Vous n'avez qu'à appeler et faire votre offre, et nous allons proposer, négocier et vous lier avec le fermier pour vous garantir une transaction protégée."}
                  </p>
                </div>
              </div>

              {/* Content - Aligned with title section */}
              <div className="px-5 pb-5 pt-4 flex-1 flex flex-col justify-center">
                {/* Instructions Section */}
                <div className="mb-3.5 p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
                  <div className="text-xs font-semibold text-[var(--color-text)] mb-2">
                    {t("callInstructionsTitle") || "Comment nous contacter ?"}
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
                    <div className="flex items-start gap-2">
                      <span className="font-medium" style={{ color: accent }}>•</span>
                      <span>{t("callInstructionsDirect") || "Pour appeler directement, appuyez sur le premier bouton"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium" style={{ color: accent }}>•</span>
                      <span>{t("callInstructionsNumbers") || "Pour voir tous nos numéros disponibles, cliquez sur le deuxième bouton"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium" style={{ color: accent }}>•</span>
                      <span>{t("callInstructionsRequest") || "Pour que nous vous appelions, appuyez sur le troisième bouton"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start space-y-2 w-full">
                  {/* Call Button */}
                  <button
                    type="button"
                    className="w-full max-w-[260px] py-2.5 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 shadow-md hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-start gap-2.5 group"
                    style={{ backgroundColor: accent }}
                    onClick={() => {
                      // Call first number directly
                      if (callNumbers.length > 0) {
                        window.location.href = `tel:${callNumbers[0].phone.replace(/\s+/g, "")}`;
                      }
                    }}
                  >
                    <Phone className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                    <span className="text-sm whitespace-nowrap">{t("callNow") || "Appeler maintenant"}</span>
                  </button>

                  {/* Available Numbers Button */}
                  <button
                    type="button"
                    className="w-full max-w-[260px] py-2.5 px-4 rounded-lg font-semibold border-2 transition-all hover:opacity-90 shadow-md hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-start gap-2.5 group"
                    style={{ 
                      borderColor: accent,
                      color: accent,
                      backgroundColor: "transparent"
                    }}
                    onClick={() => setShowNumbers(true)}
                  >
                    <Phone className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" style={{ color: accent }} />
                    <span className="text-sm whitespace-nowrap">{t("availableNumbers") || "Voir les numéros disponibles"}</span>
                  </button>

                  {/* Request Call Button */}
                  <button
                    type="button"
                    className="w-full max-w-[260px] py-2.5 px-4 rounded-lg font-semibold border-2 transition-all hover:opacity-90 shadow-md hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-start gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group"
                    style={{ 
                      borderColor: accent,
                      color: accent,
                      backgroundColor: "transparent"
                    }}
                    onClick={async () => {
                      if (!listing?.id && !listing?._id) return;
                      setRequestingCall(true);
                      try {
                        const listingId = listing?.id || listing?._id;
                        const message = t("callRequestMessage") || (language === "ar" 
                          ? "أريد أن تتصلوا بي بخصوص هذه القائمة"
                          : "Je veux que vous m'appeliez concernant cette annonce");
                        
                        await createInquiry(listingId, {
                          message,
                          name: user?.fullName || user?.username || undefined,
                          email: user?.email || undefined,
                          phone: user?.phone || undefined,
                        });
                        
                        alert(t("callRequestSent") || "Demande envoyée ! Le centre d'appel vous contactera bientôt.");
                      } catch {
                        alert(t("errorOccurred") || "Une erreur s'est produite. Veuillez réessayer.");
                      } finally {
                        setRequestingCall(false);
                      }
                    }}
                    disabled={requestingCall}
                  >
                    {requestingCall ? (
                      <>
                        <span className="animate-spin w-4 h-4 rounded-full border-2 border-current border-t-transparent flex-shrink-0" style={{ borderColor: accent }} />
                        <span className="text-sm">{t("sending") || "Envoi..."}</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" style={{ color: accent }} />
                        <span className="text-sm whitespace-nowrap">{t("requestCall") || "Je veux que vous m'appeliez"}</span>
                      </>
                    )}
                  </button>

                  {/* Note about call request */}
                  <div className="w-full max-w-[260px] text-xs text-[var(--color-text-muted)] leading-relaxed pt-1.5 text-left">
                    {t("callRequestNote") || "Cliquez sur ce bouton et notre centre d'appel vous contactera rapidement."}
                  </div>
                </div>

                {/* Owner info */}
                {isOwner && (
                  <div className="mt-auto pt-4 border-t border-[var(--color-border)] w-full">
                    <div className="text-xs text-[var(--color-text-muted)]">
                      <span className="font-medium">{t("adminAccessLabel") || "Accès"}:</span> {t("adminAccessLimited") || "éditeur"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Image matching left column height */}
          <div className="lg:sticky lg:top-6 lg:self-start w-full">
            <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm h-full w-full">
              {/* Main Image - Full height to match left column */}
              <div className="relative bg-[var(--color-surface-muted)] h-full min-h-[500px] lg:min-h-[600px]">
                {images.length > 0 ? (
                  <img
                    src={images[activeImg]}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Try asset fallback first, then SVG placeholder
                      const assetFallback = getFallbackImage(category, activeImg);
                      if (e.currentTarget.src !== assetFallback) {
                        e.currentTarget.src = assetFallback;
                      } else {
                        e.currentTarget.src = svgPlaceholder({
                          label: categoryLabel,
                          accent: accent,
                          darkMode: darkMode,
                        });
                      }
                    }}
                  />
                ) : (
                  <img
                    src={getFallbackImage(category, 0) || svgPlaceholder({
                      label: categoryLabel,
                      accent: accent,
                      darkMode: darkMode,
                    })}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If asset fallback fails, use SVG placeholder
                      if (e.currentTarget.src !== svgPlaceholder({
                        label: categoryLabel,
                        accent: accent,
                        darkMode: darkMode,
                      })) {
                        e.currentTarget.src = svgPlaceholder({
                          label: categoryLabel,
                          accent: accent,
                          darkMode: darkMode,
                        });
                      }
                    }}
                  />
                )}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImg((p) => (p - 1 + images.length) % images.length)
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-2 border-[var(--color-border)] rounded-full p-3 shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all z-20 hover:scale-110"
                      style={{ borderColor: accent }}
                      aria-label={t("previousImage") || "Image précédente"}
                    >
                      <ChevronLeft className="w-6 h-6" style={{ color: accent }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-2 border-[var(--color-border)] rounded-full p-3 shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all z-20 hover:scale-110"
                      style={{ borderColor: accent }}
                      aria-label={t("nextImage") || "Image suivante"}
                    >
                      <ChevronRight className="w-6 h-6" style={{ color: accent }} />
                    </button>
                    {/* Image counter */}
                    {images.length > 0 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-20">
                        {activeImg + 1} / {images.length}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 border-t border-[var(--color-border)]">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImg(idx)}
                        className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === activeImg
                            ? "border-[var(--category-accent)]"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                        style={{
                          width: "80px",
                          height: "60px",
                        }}
                      >
                        <img
                          src={img}
                          alt={`${title}-${idx}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Try asset fallback first, then SVG placeholder
                            const assetFallback = getFallbackImage(category, idx);
                            if (e.currentTarget.src !== assetFallback) {
                              e.currentTarget.src = assetFallback;
                            } else {
                              e.currentTarget.src = svgPlaceholder({
                                label: categoryLabel,
                                accent: accent,
                                darkMode: darkMode,
                              });
                            }
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Section - Full Width with Two Columns */}
        <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-6">{t("description") || "Description"}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Left Column - Description Text */}
            <div>
              {description ? (
                <div 
                  className="text-sm leading-relaxed text-[var(--color-text)] formatted-description prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: parseFormattedText(description) }}
                />
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">
                  {t("noDescription") || "Aucune description disponible."}
                </p>
              )}
            </div>

            {/* Right Column - Key Information Icons */}
            {customFields.length > 0 && (
              <div className="lg:border-l lg:pl-6 border-[var(--color-border)]">
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
                  {t("information") || "Informations"}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {customFields.slice(0, 12).map((field) => {
                    const Icon = field.icon || Package;
                    return (
                      <div
                        key={field.key}
                        className="flex flex-col items-center p-3 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)] transition-all border border-transparent hover:border-[var(--category-accent)] cursor-pointer"
                        title={`${field.label}: ${field.value}`}
                      >
                        <Icon className="w-5 h-5 mb-2" style={{ color: accent }} />
                        <div className="text-xs font-medium text-[var(--color-text-muted)] text-center mb-1 line-clamp-1">
                          {field.label}
                        </div>
                        <div className="text-sm font-semibold text-[var(--color-text)] text-center line-clamp-1">
                          {field.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {customFields.length > 12 && (
                  <div className="mt-4 text-xs text-center text-[var(--color-text-muted)]">
                    {t("andMore") || "Et"} {customFields.length - 12} {t("moreFields") || "autres informations"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Listings - Full Width */}
        {similar.length > 0 && (
          <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm mt-8">
            <h3 className="text-xl font-bold mb-6">{t("similarListings") || "Annonces similaires"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((l) => {
                const catLabel = labelFor(l.category || "");
                const accentSim = accentFor(l.category || "");
                // Use already normalized images array from filter mapping
                const simImg = l.images?.[0] || null;
                return (
                  <div
                    key={l.id || l._id}
                    className="flex flex-col border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--category-accent)] hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-[var(--color-surface)]"
                    onClick={() => navigate(`/listing/${l.id || l._id}`)}
                  >
                    <div className="aspect-[4/3] bg-[var(--color-surface-muted)] overflow-hidden">
                      {simImg ? (
                        <img
                          src={simImg}
                          alt={pickLocalized(l.title, language)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Try asset fallback first, then SVG placeholder
                            const assetFallback = getFallbackImage(l.category || "", 0);
                            if (e.currentTarget.src !== assetFallback) {
                              e.currentTarget.src = assetFallback;
                            } else {
                              e.currentTarget.src = svgPlaceholder({
                                label: catLabel,
                                accent: accentSim,
                                darkMode: darkMode,
                              });
                            }
                          }}
                        />
                      ) : (
                        <img
                          src={getFallbackImage(l.category || "", 0) || svgPlaceholder({
                            label: catLabel,
                            accent: accentSim,
                            darkMode: darkMode,
                          })}
                          alt={pickLocalized(l.title, language)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If asset fallback fails, use SVG placeholder
                            if (e.currentTarget.src !== svgPlaceholder({
                              label: catLabel,
                              accent: accentSim,
                              darkMode: darkMode,
                            })) {
                              e.currentTarget.src = svgPlaceholder({
                                label: catLabel,
                                accent: accentSim,
                                darkMode: darkMode,
                              });
                            }
                          }}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-semibold line-clamp-2 mb-3 min-h-[2.5rem] text-[var(--color-text)]">
                        {pickLocalized(l.title, language)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[var(--color-text-muted)] font-medium">{catLabel}</div>
                        <div className="text-lg font-bold" style={{ color: accentSim }}>
                          {formatPrice(l.pricePerKg ?? l.price ?? 0)} DA
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Load More Button */}
            {hasMoreSimilar && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={loadMoreSimilar}
                  disabled={similarLoading}
                  className="px-6 py-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: accent }}
                >
                  {similarLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 rounded-full border-2 border-[var(--color-border)] border-t-current" />
                      {t("loading") || "Chargement..."}
                    </span>
                  ) : (
                    t("loadMore") || "Charger plus"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
        </div>

      {/* Phone Numbers Modal - Improved Design */}
      {showNumbers && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fadeIn"
          onClick={() => setShowNumbers(false)}
        >
          <div
            className="bg-[var(--color-surface)] text-[var(--color-text)] rounded-2xl shadow-2xl border border-[var(--color-border)] max-w-md w-full p-6 space-y-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: `${accent}15` }}>
                <Phone className="w-8 h-8" style={{ color: accent }} />
              </div>
              <div className="text-2xl font-bold mb-2">{CALL_CENTER.name}</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {t("callCenterTitle") || "Centre d'appel"}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[var(--color-surface-muted)] rounded-lg p-4 border border-[var(--color-border)]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accent }} />
                <div className="text-sm text-[var(--color-text)]">
                  <div className="font-semibold mb-1">{t("chooseNumber") || "Choisissez un numéro"}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {t("callCenterOnly") || "Contactez-nous via le centre d'appel uniquement. Pas de contact direct avec le vendeur."}
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Numbers List */}
            <div className="space-y-3">
              {callNumbers.map((c, idx) => (
                <a
                  key={c.label}
                  href={`tel:${c.phone.replace(/\s+/g, "")}`}
                  className="flex items-center justify-between px-5 py-4 rounded-xl border-2 border-[var(--color-border)] hover:border-[var(--category-accent)] transition-all hover:shadow-md bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)] group"
                  style={{
                    borderColor: idx === 0 ? accent : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ backgroundColor: idx === 0 ? accent : "var(--color-text-muted)" }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-text)]">{c.label}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {t("center") || "Centre"} {idx + 1}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg" style={{ color: accent }}>
                      {c.phone}
                    </span>
                    <Phone className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                  </div>
                </a>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                className="w-full py-3 rounded-lg font-medium border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-all text-[var(--color-text)]"
                onClick={() => setShowNumbers(false)}
              >
                {t("close") || "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
