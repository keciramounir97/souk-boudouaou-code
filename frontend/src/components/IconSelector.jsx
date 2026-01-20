import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { iconCategories, getAllIcons } from "../utils/iconLibrary";

export default function IconSelector({ selectedIcon, onSelect, accent = "#3b82f6" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(iconCategories)[0]);

  const allIcons = getAllIcons();
  const filteredIcons = searchTerm
    ? allIcons.filter(
        (icon) =>
          icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : iconCategories[selectedCategory]?.icons || [];

  const selectedIconData = allIcons.find((icon) => icon.name === selectedIcon);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)] transition w-full"
      >
        {selectedIconData ? (
          <>
            <selectedIconData.component className="w-4 h-4" style={{ color: accent }} />
            <span className="text-sm flex-1 text-left">{selectedIconData.label}</span>
          </>
        ) : (
          <span className="text-sm flex-1 text-left text-[var(--color-text-muted)]">
            Sélectionner une icône
          </span>
        )}
        <X className="w-4 h-4 text-[var(--color-text-muted)]" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl max-h-[500px] flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une icône..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ focusRingColor: accent }}
                />
              </div>
            </div>

            {/* Category Tabs */}
            {!searchTerm && (
              <div className="flex gap-1 p-2 border-b border-[var(--color-border)] overflow-x-auto">
                {Object.entries(iconCategories).map(([key, category]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === key
                        ? "text-white"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
                    }`}
                    style={
                      selectedCategory === key
                        ? { backgroundColor: accent }
                        : {}
                    }
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((icon) => {
                  const IconComponent = icon.component;
                  const isSelected = icon.name === selectedIcon;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => {
                        onSelect(icon.name);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`p-2 rounded-lg border transition flex flex-col items-center gap-1 ${
                        isSelected
                          ? ""
                          : "border-[var(--color-border)] hover:border-[var(--category-accent)]"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: `${accent}15`, borderColor: accent }
                          : {}
                      }
                      title={icon.label}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: isSelected ? accent : "var(--color-text)" }}
                      />
                      <span className="text-[10px] text-center leading-tight text-[var(--color-text-muted)] truncate w-full">
                        {icon.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
