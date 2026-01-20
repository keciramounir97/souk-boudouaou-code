import React from "react";
import { useTranslation } from "../../context/translationContext";
import { useTheme } from "../../context/themeContext";
import { Moon, Sun, Globe } from "lucide-react";

export default function GlobalSettings() {
  const { t, language, setLanguage } = useTranslation();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="space-y-6">
      <h1 className="responsive-title">
        {t("adminSettings") || "Paramètres Généraux"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <div className="detail-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--category-accent)]/10 text-[var(--category-accent)]">
              {darkMode ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <div>
              <h2 className="font-bold text-lg">{t("theme")}</h2>
              <p className="text-sm opacity-60">
                {darkMode ? t("darkMode") : t("lightMode")}
              </p>
            </div>
          </div>
          <button className="btn-secondary w-full" onClick={toggleDarkMode}>
            {t("toggle") || "Basculer"}
          </button>
        </div>

        {/* Language */}
        <div className="detail-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--category-accent)]/10 text-[var(--category-accent)]">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg">{t("language")}</h2>
              <p className="text-sm opacity-60">
                {language === "fr" ? "Français" : "Arabic"}
              </p>
            </div>
          </div>
          <select
            className="form-select w-full"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>
    </div>
  );
}
