import { useEffect, useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTheme } from "../context/themeContext";

const defaultAccent = "#ff7a00";

const toRgba = (hex, alpha) => {
  if (!hex?.startsWith("#")) return hex;
  const clean = hex.slice(1);
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 18px",
    borderRadius: "var(--radius-button)",
    margin: "0",
    position: "relative",
    flexWrap: "nowrap",
    width: "100%",
    boxSizing: "border-box",
    justifyContent: "space-between",
    overflowX: "auto",
    overflow: "visible",
    WebkitOverflowScrolling: "touch",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "10px 18px",
    fontSize: "15px",
    color: "var(--color-text)",
    minWidth: "0",
  },
  btn: {
    border: "none",
    borderRadius: "var(--radius-button)",
    padding: "0 16px",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",
    transition: "transform 0.15s ease",
    flexShrink: 0,
    height: "46px",
    justifyContent: "center",
  },
  filterBtn: {
    color: "#fff",
    fontWeight: "bold",
    minWidth: "150px",
    padding: "0 20px",
    height: "44px",
  },
  filterBtnActive: {
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
  },
  orderBtn: {
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--color-text)",
    fontWeight: "600",
    minWidth: "150px",
    padding: "0 18px",
    height: "44px",
    justifyContent: "center",
  },
  orderLabelStack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "3px",
  },
  orderLabelTop: {
    fontSize: "10px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
  },
  orderLabelBottom: {
    fontSize: "14px",
    fontWeight: 600,
  },
  searchBtn: {
    background: defaultAccent,
    color: "#fff",
    borderRadius: "var(--radius-button)",
    border: "none",
    padding: "0 18px",
    minWidth: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "15px",
    height: "44px",
  },
  orderWrapper: {
    position: "relative",
    flexShrink: 0,
    overflow: "visible",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: "0",
    borderRadius: "14px",
    boxShadow: "0 16px 50px rgba(0,0,0,0.2)",
    overflow: "hidden",
    zIndex: 9999,
    minWidth: "190px",
  },
  dropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default function SearchFilterBar({
  query,
  onQueryChange,
  placeholder,
  showFilters,
  onToggleFilters,
  orderOptions = [],
  orderBy,
  orderOpen,
  setOrderOpen,
  onOrderChange,
  accent,
  language,
  onSearch,
  orderLabel,
  filtersLabel,
  orderActionLabel,
  searchLabel,
}) {
  const wrapperRef = useRef(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    if (!orderOpen) return undefined;
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        orderOpen
      ) {
        setOrderOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [orderOpen, setOrderOpen]);

  const effectiveAccent = accent || defaultAccent;
  const fallbackOrderLabel =
    orderLabel ||
    orderOptions.find((opt) => opt.key === orderBy)?.label ||
    orderOptions[0]?.label ||
    (language === "ar" ? "التصفية" : "Order");
  const filtersText =
    filtersLabel || (language === "ar" ? "الفلاتر" : "Filtres");
  const orderActionText =
    orderActionLabel ||
    (language === "ar" ? "تخصيص الترتيب" : "Filtrer l'ordre");
  const searchText = searchLabel || (language === "ar" ? "ابحث" : "Rechercher");
  const containerStyle = {
    // Only keeping dynamic styles that change based on theme/accent
    background: darkMode
      ? "var(--color-surface-muted)"
      : "var(--color-surface)",
    borderColor: darkMode ? "rgba(255,255,255,0.18)" : "var(--color-border)",
    boxShadow: darkMode
      ? "0 20px 50px rgba(0,0,0,0.35)"
      : "0 24px 70px rgba(15,23,42,0.08)",
  };

  return (
    <div className="search-filter-bar" ref={wrapperRef}>
      <div className="flex items-center flex-1 min-w-0">
        <Search className="ml-3 opacity-40" size={18} />
        <input
          type="text"
          className="search-bar-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch?.();
          }}
        />
      </div>

      <div className="flex items-center gap-2 pr-1">
        <button
          type="button"
          className={`search-bar-btn filter-btn ${showFilters ? "active" : ""}`}
          style={{ background: effectiveAccent }}
          onClick={onToggleFilters}
        >
          <SlidersHorizontal size={14} className="mr-1.5" />
          <span className="filter-text-span">{filtersText}</span>
        </button>

        <button
          type="button"
          className="search-bar-btn search-submit-btn"
          style={{ background: effectiveAccent }}
          onClick={onSearch}
          aria-label={searchText}
        >
          <Search size={18} strokeWidth={3} color="#fff" />
        </button>
      </div>
    </div>
  );
}
