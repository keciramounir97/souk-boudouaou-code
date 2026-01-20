import React, { useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { useCategories } from "../../context/categoryContext";
import { useTranslation } from "../../context/translationContext";
import { useAuth } from "../../context/AuthContext";

function withAlpha(color, alpha = 0.2) {
  const hex = String(color || "").trim();
  if (!hex.startsWith("#")) return color;
  const raw = hex.slice(1);
  const num = parseInt(
    raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw,
    16
  );
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function alpha(color, amount = 0.15) {
  const hex = String(color || "").replace("#", "");
  if (hex.length !== 6 && hex.length !== 8) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${amount})`;
}

export default function Categories() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const {
    categories,
    visibleCategories,
    addCategory,
    toggleVisibility,
    removeCategory,
    updateCategory,
  } = useCategories();

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">{t("accessDenied") || "Accès refusé"}</h1>
          <p className="text-[var(--color-text-muted)]">{t("adminSuperAdminOnly") || "Cette page est réservée aux super administrateurs"}</p>
        </div>
      </div>
    );
  }

  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    iconUrl: "",
    accent: "#4c8df7",
  });
  const [iconError, setIconError] = useState("");
  const [inlineIconError, setInlineIconError] = useState({});
  const [openEditor, setOpenEditor] = useState({});

  const nextAccent = useMemo(() => {
    const palette = ["#4c8df7", "#f97316", "#22c55e", "#a855f7", "#0ea5e9"];
    return palette[categories.length % palette.length] || "#4c8df7";
  }, [categories.length]);

  const generateValue = () =>
    `cat-${categories.length + 1}-${Math.floor(Math.random() * 1000)}`;

  const onSubmit = (e) => {
    e.preventDefault();
    const value = generateValue();
    addCategory({
      value,
      iconUrl: form.iconUrl,
      accent: form.accent || nextAccent,
      labels: { fr: value, en: value, ar: value },
      visible: true,
    });
    setForm({ iconUrl: "", accent: nextAccent });
    setIconError("");
  };

  const handleIconFile = (file) => {
    setIconError("");
    if (!file) return;
    if (file.type !== "image/png") {
      setIconError("PNG 64-128px requis");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        if (width < 64 || height < 64 || width > 128 || height > 128) {
          setIconError("Utilisez un PNG entre 64x64 et 128x128.");
          return;
        }
        setForm((p) => ({ ...p, iconUrl: dataUrl }));
      };
      img.onerror = () => setIconError("Impossible de lire le PNG.");
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateIcon = (categoryId, file) => {
    setInlineIconError((p) => ({ ...p, [categoryId]: "" }));
    if (!file) return;
    if (file.type !== "image/png") {
      setInlineIconError((p) => ({
        ...p,
        [categoryId]: "PNG 64-128px requis",
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        if (width < 64 || height < 64 || width > 128 || height > 128) {
          setInlineIconError((p) => ({
            ...p,
            [categoryId]: "Utilisez un PNG entre 64x64 et 128x128.",
          }));
          return;
        }
        updateCategory(categoryId, { iconUrl: dataUrl });
      };
      img.onerror = () =>
        setInlineIconError((p) => ({
          ...p,
          [categoryId]: "Impossible de lire le PNG.",
        }));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="detail-card relative overflow-hidden rounded-2xl border-none shadow-xl">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--category-accent)]/20 via-transparent to-[var(--category-accent)]/10 pointer-events-none"
          style={{ backgroundColor: withAlpha(nextAccent, 0.05) }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--category-accent)]/10 text-[var(--category-accent)] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t("adminTitleCategories")}
            </div>
            <h1 className="responsive-title mb-2">
              Configuration des Catégories
            </h1>
            <p className="text-sm opacity-60 max-w-2xl leading-relaxed">
              {t("adminCategoriesHint")}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--color-surface)]/50 backdrop-blur-md p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--category-accent)]">
                {visibleCategories.length}
              </div>
              <div className="text-[10px] font-bold uppercase opacity-40">
                {t("adminCategoryVisible")}
              </div>
            </div>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div className="text-center">
              <div className="text-2xl font-bold opacity-80">
                {categories.length}
              </div>
              <div className="text-[10px] font-bold uppercase opacity-40">
                Total
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-card">
        <h2 className="responsive-subtitle mb-6 px-1 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[var(--category-accent)]" />
          Ajouter une Catégorie
        </h2>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 block">
              Icone PNG (64-128px)
            </label>
            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--category-accent)]/30 transition-colors group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png"
                className="hidden"
                onChange={(e) => handleIconFile(e.target.files?.[0])}
              />
              <button
                type="button"
                className="w-16 h-16 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center border border-[var(--color-border)] group-hover:scale-110 transition-transform"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.iconUrl ? (
                  <img
                    src={form.iconUrl}
                    alt="Preview"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 opacity-30 group-hover:opacity-100 text-[var(--category-accent)] transition-opacity" />
                )}
              </button>
              <div className="flex-1">
                <button
                  type="button"
                  className="text-sm font-bold text-[var(--category-accent)] hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choisir une image
                </button>
                <p className="text-[10px] opacity-50 mt-1 uppercase tracking-tight font-medium">
                  PNG transparent uniquement
                </p>
              </div>
            </div>
            {iconError && (
              <div className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-tight">
                {iconError}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <label className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 block">
              {t("adminCategoryAccent")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-12 h-12 rounded-xl border border-[var(--color-border)] cursor-pointer bg-transparent p-1"
                value={form.accent || "#4c8df7"}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accent: e.target.value }))
                }
              />
              <input
                className="form-input flex-1 font-mono text-xs font-bold uppercase"
                value={form.accent || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accent: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-[var(--category-accent)]/20"
            >
              <Plus className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider text-xs">
                {t("adminCategoryAdd")}
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="responsive-grid-2 xl:grid-cols-3">
        {categories.map((c) => {
          const soft = alpha(c.accent, 0.12);
          const isEditing = openEditor[c.id];

          return (
            <div
              key={c.id}
              className={`detail-card group transition-all duration-300 hover:-translate-y-1 ${
                isEditing
                  ? "ring-2 ring-[var(--category-accent)]/30 border-transparent shadow-2xl"
                  : "hover:shadow-xl"
              }`}
              style={{
                borderTop: `4px solid ${c.accent}`,
              }}
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="h-14 w-14 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-2"
                    style={{
                      backgroundColor: soft,
                      border: `1px solid ${withAlpha(c.accent, 0.2)}`,
                    }}
                  >
                    {c.iconUrl ? (
                      <img
                        src={c.iconUrl}
                        alt={c.value}
                        className="w-full h-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 text-lg font-bold"
                        style={{ color: c.accent }}
                      >
                        {c.value?.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate opacity-90">
                      {c.value}
                    </div>
                    <div className="text-[10px] font-mono opacity-40 uppercase tracking-tighter truncate">
                      {c.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[var(--color-surface-muted)]/50 p-1 rounded-xl border border-[var(--color-border)]">
                  <button
                    type="button"
                    className={`p-2 rounded-lg transition-all ${
                      c.visible
                        ? "text-emerald-500 bg-emerald-500/10 shadow-sm"
                        : "opacity-30 hover:opacity-100"
                    }`}
                    onClick={() => toggleVisibility(c.id)}
                    title={c.visible ? "Visible" : "Caché"}
                  >
                    {c.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg opacity-30 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    onClick={() => removeCategory(c.id)}
                    title={t("delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded-lg transition-all ${
                      isEditing
                        ? "text-[var(--category-accent)] bg-[var(--category-accent)]/10"
                        : "opacity-30 hover:opacity-100 hover:text-[var(--category-accent)] hover:bg-[var(--category-accent)]/10"
                    }`}
                    onClick={() =>
                      setOpenEditor((p) => ({ ...p, [c.id]: !p[c.id] }))
                    }
                    title="Modifier"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1.5 block">
                        Nouveau Logo (PNG)
                      </label>
                      <input
                        type="file"
                        accept="image/png"
                        className="hidden"
                        id={`icon-upload-${c.id}`}
                        onChange={(e) =>
                          handleUpdateIcon(c.id, e.target.files?.[0])
                        }
                      />
                      <button
                        type="button"
                        className="btn-secondary w-full text-[10px] font-bold uppercase tracking-wider py-2 flex items-center justify-center gap-2"
                        onClick={() =>
                          document
                            .getElementById(`icon-upload-${c.id}`)
                            ?.click()
                        }
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Changer l'icône
                      </button>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1.5 block">
                        Couleur Accent
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          className="w-10 h-9 rounded-lg border border-[var(--color-border)] cursor-pointer bg-transparent p-1"
                          value={c.accent}
                          onChange={(e) =>
                            updateCategory(c.id, { accent: e.target.value })
                          }
                        />
                        <input
                          className="form-input text-[10px] font-mono py-2 font-bold uppercase text-center"
                          value={c.accent}
                          onChange={(e) =>
                            updateCategory(c.id, { accent: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {inlineIconError[c.id] && (
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                      {inlineIconError[c.id]}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
