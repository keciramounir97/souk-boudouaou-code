import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Sun,
  Moon,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  ChevronRight,
  Home,
} from "lucide-react";

import { useTheme } from "../context/themeContext";
import { useTranslation } from "../context/translationContext";
import { useCategoryOptions } from "../hooks/useCategoryOptions";
import { normalizeImageUrl, normalizeCategoryValue } from "../utils/images";
import Logo from "./Logo";

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

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, rtl, t } = useTranslation();
  const { options: categories, labelFor } = useCategoryOptions();
  const [expandedSection, setExpandedSection] = useState(null);

  const goToCategory = (category) => {
    const normalizedValue = normalizeCategoryValue(category);
    navigate(`/?category=${encodeURIComponent(normalizedValue)}`, { replace: true });
    setOpen(false);
  };

  const goToHome = () => {
    navigate("/");
    setOpen(false);
  };

  const currentCategory = new URLSearchParams(location.search).get("category");

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel - Ouedkniss-inspired */}
      <div
        className={`
          fixed top-0 ${rtl ? "right-0" : "left-0"}
          h-full w-72 sm:w-80
          z-50
          transition-transform duration-300 ease-out
          ${
            open
              ? "translate-x-0"
              : rtl
              ? "translate-x-full"
              : "-translate-x-full"
          }
          ${darkMode ? "bg-[#0f0f0f]" : "bg-white"}
          text-[var(--color-text)]
          shadow-2xl border-r ${darkMode ? "border-white/10" : "border-slate-200"}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? "border-white/10" : "border-slate-200"} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Logo
              alt="logo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
            <span className="font-bold text-lg">Menu</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} className="text-[var(--category-accent)]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Home Link */}
          <button
            onClick={goToHome}
            className={`w-full px-6 py-3 flex items-center gap-3 text-left transition-colors ${
              location.pathname === "/" && !currentCategory
                ? "bg-[var(--category-accent)]/10 text-[var(--category-accent)] font-semibold"
                : "hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Home size={20} className="text-[var(--category-accent)]" />
            <span>{t("home") || "Accueil"}</span>
          </button>

          {/* Categories Section */}
          <div className="px-6 py-4">
            <div className="space-y-1">
              {categories.map((c) => {
                const name = labelFor(c.value);
                const normalizedCurrent = currentCategory ? normalizeCategoryValue(currentCategory) : null;
                const normalizedCategory = normalizeCategoryValue(c.value);
                const isActive = normalizedCurrent === normalizedCategory;
                const iconBg = isActive
                  ? "rgba(255, 255, 255, 0.2)"
                  : withAlpha(c.accent, darkMode ? 0.2 : 0.15);
                return (
                  <button
                    key={c.value}
                    onClick={() => goToCategory(c.value)}
                    className={`
                      w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left transition-all
                      ${
                        isActive
                          ? "bg-[var(--category-accent)] text-white font-semibold shadow-md"
                          : "hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-sm"
                      }
                    `}
                    style={
                      isActive
                        ? { backgroundColor: c.accent }
                        : {
                            backgroundColor: "transparent",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = withAlpha(c.accent, darkMode ? 0.15 : 0.1);
                        const iconDiv = e.currentTarget.querySelector('div[style*="backgroundColor"]');
                        if (iconDiv) {
                          iconDiv.style.transform = "scale(1.1)";
                          iconDiv.style.boxShadow = `0 6px 16px ${withAlpha(c.accent, 0.2)}, 0 2px 4px rgba(0, 0, 0, 0.1)`;
                          iconDiv.style.borderColor = c.accent;
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        const iconDiv = e.currentTarget.querySelector('div[style*="backgroundColor"]');
                        if (iconDiv) {
                          iconDiv.style.transform = "scale(1)";
                          iconDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)";
                          iconDiv.style.borderColor = withAlpha(c.accent, 0.3);
                        }
                      }
                    }}
                  >
                    {/* Icon Container - Same as home page */}
                    <div
                      className={`flex-shrink-0 flex items-center justify-center ${
                        isActive ? "category-icon-active" : ""
                      }`}
                    style={{
                      backgroundColor: isActive
                        ? iconBg
                        : withAlpha(c.accent, darkMode ? 0.25 : 0.2),
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-md)",
                      boxShadow: isActive ? "0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)" : "0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)",
                      border: isActive ? "2px solid rgba(255, 255, 255, 0.3)" : `2px solid ${withAlpha(c.accent, 0.3)}`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    >
                      {typeof c.iconUrl === "string" && c.iconUrl.trim() ? (
                        <img
                          src={normalizeImageUrl(c.iconUrl)}
                          alt={name}
                          className="object-contain"
                          style={{
                            width: "24px",
                            height: "24px",
                            filter: isActive ? "brightness(1.1) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))" : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span 
                          style={{ 
                            fontSize: "0.875rem", 
                            fontWeight: 700,
                            color: isActive ? "#fff" : "var(--color-text)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {c.icon || String(c.value || "?").slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className={`flex-1 text-sm ${isActive ? "font-semibold" : "font-medium"}`} style={{ opacity: isActive ? 1 : 0.9 }}>
                      {name}
                    </span>
                    {isActive && (
                      <ChevronRight size={16} className="opacity-70" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Section */}
          <div className={`px-6 py-4 border-t ${darkMode ? "border-white/10" : "border-slate-200"}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3 px-2">
              {t("settings") || "Paramètres"}
            </h3>

            {/* Language Selector */}
            <div className="mb-3">
              <label className="text-xs font-semibold mb-1.5 block px-2 opacity-70">
                {t("language") || "Langue"}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm border ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-[var(--category-accent)]/20`}
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left transition-colors ${
                darkMode
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              {darkMode ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
              <span className="text-sm">
                {darkMode ? t("lightMode") : t("darkMode")}
              </span>
            </button>
          </div>
        </div>

        {/* Footer - Social Icons */}
        <div className={`px-6 py-4 border-t ${darkMode ? "border-white/10" : "border-slate-200"}`}>
          <div className="flex items-center justify-center gap-4">
            {[Facebook, Instagram, MessageCircle, Mail].map((Icon, idx) => (
              <button
                key={idx}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? "hover:bg-white/10 text-slate-400 hover:text-[var(--category-accent)]"
                    : "hover:bg-slate-100 text-slate-600 hover:text-[var(--category-accent)]"
                }`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
          <div className="text-center text-xs opacity-60 mt-3">
            © {new Date().getFullYear()} Souk Boudouaou
          </div>
        </div>
      </div>
    </>
  );
}
