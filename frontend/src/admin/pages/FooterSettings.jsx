import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Link as LinkIcon,
  Plus,
  Trash,
  LayoutTemplate,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import {
  adminGetFooterSettings,
  adminUpdateFooterSettings,
} from "../../api/dataService";
import { useToast } from "../../context/ToastContext";

const defaults = {
  backgroundColor: "",
  textColor: "",
  aboutTitleFr: "",
  aboutTitleAr: "",
  aboutFr: "",
  aboutAr: "",
  callCenters: ["+213 791 948 070"],
  columns: [
    {
      titleFr: "Navigation",
      titleAr: "روابط",
      links: [
        { labelFr: "Favoris", labelAr: "المحفوظات", href: "/saved" },
        { labelFr: "Parametres", labelAr: "الإعدادات", href: "/settings" },
      ],
    },
  ],
};

export default function FooterSettings() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const isSuperAdmin = user?.role === "super_admin";

  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const json = await adminGetFooterSettings();
        const footer = json?.data?.footer || json?.footer || defaults;
        if (active) setForm({ ...defaults, ...footer });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="detail-card text-center py-12">
        <h1 className="responsive-title">{t("accessDenied")}</h1>
        <button className="btn-primary mt-6" onClick={() => navigate("/admin")}>
          {t("back")}
        </button>
      </div>
    );
  }

  const updateColumn = (idx, patch) => {
    setForm((prev) => {
      const cols = [...(prev.columns || [])];
      cols[idx] = { ...cols[idx], ...patch };
      return { ...prev, columns: cols };
    });
  };

  const updateLink = (cIdx, lIdx, patch) => {
    setForm((prev) => {
      const cols = [...(prev.columns || [])];
      const links = [...(cols[cIdx]?.links || [])];
      links[lIdx] = { ...links[lIdx], ...patch };
      cols[cIdx] = { ...cols[cIdx], links };
      return { ...prev, columns: cols };
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-strong)] flex items-center gap-3">
            <LayoutTemplate
              size={32}
              className="text-[var(--category-accent)]"
            />
            {t("adminTitleFooter") || "Pied de page"}
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-2xl">
            {t("adminFooterHint") ||
              "Personnalisez l'apparence, le contenu et les liens du pied de page de votre site."}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate("/admin")}>
            {t("adminNavDashboard")}
          </button>
          <button
            className="btn-primary flex items-center gap-2 px-6 shadow-lg hover:shadow-xl transition-all"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const payload = { footer: form };
                const json = await adminUpdateFooterSettings(payload);
                const footer = json?.data?.footer || payload.footer;
                setForm({ ...defaults, ...footer });
                toast.success(
                  t("savedSuccessfully") || "Sauvegardé avec succès"
                );
              } catch (e) {
                toast.error(e?.message || "Save failed");
              } finally {
                setSaving(false);
              }
            }}
          >
            <Save className="w-4 h-4" />
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 opacity-50 font-medium animate-pulse">
          {t("loading")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* 1. Style & Brand */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
              <h2 className="text-xl font-bold">
                {t("styleAndBrand") || "Style & Marque"}
              </h2>
              <button
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    isVisible: p.isVisible !== undefined ? !p.isVisible : false,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  form.isVisible !== false
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {form.isVisible !== false ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
                {form.isVisible !== false
                  ? t("sectionVisible") || "Footer Visible"
                  : t("sectionHidden") || "Footer Masqué"}
              </button>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                  {t("backgroundColor") || "Couleur de fond"}
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    className="h-10 w-14 rounded cursor-pointer border-0"
                    value={form.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      setForm({ ...form, backgroundColor: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="field flex-1"
                    placeholder="#ffffff"
                    value={form.backgroundColor}
                    onChange={(e) =>
                      setForm({ ...form, backgroundColor: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                  {t("textColor") || "Couleur du texte"}
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    className="h-10 w-14 rounded cursor-pointer border-0"
                    value={form.textColor || "#000000"}
                    onChange={(e) =>
                      setForm({ ...form, textColor: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="field flex-1"
                    placeholder="#000000"
                    value={form.textColor}
                    onChange={(e) =>
                      setForm({ ...form, textColor: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* About Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                  {t("aboutTitleFr") || "Titre 'A propos' (FR)"}
                </label>
                <input
                  className="field w-full"
                  placeholder="A propos de nous"
                  value={form.aboutTitleFr}
                  onChange={(e) =>
                    setForm({ ...form, aboutTitleFr: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                  {t("aboutTitleAr") || "Titre 'A propos' (AR)"}
                </label>
                <input
                  className="field w-full text-right"
                  placeholder="معلومات عنا"
                  value={form.aboutTitleAr}
                  onChange={(e) =>
                    setForm({ ...form, aboutTitleAr: e.target.value })
                  }
                />
              </div>
            </div>

            {/* About Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                  {t("footerAboutFr") || "Description (FR)"}
                </label>
                <textarea
                  className="field w-full min-h-[100px] resize-y"
                  value={form.aboutFr}
                  onChange={(e) =>
                    setForm({ ...form, aboutFr: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                  {t("footerAboutAr") || "Description (AR)"}
                </label>
                <textarea
                  className="field w-full min-h-[100px] resize-y text-right"
                  value={form.aboutAr}
                  onChange={(e) =>
                    setForm({ ...form, aboutAr: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 2. Contact section removed - moved to CallCenters.jsx */}

          {/* 3. Columns */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold m-0 border-b-0 pb-0">
                {t("footerColumns") || "Liens de navigation"}
              </h2>
              <button
                type="button"
                className="btn-primary py-2 px-4 shadow-sm text-sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    columns: [
                      ...(prev.columns || []),
                      { titleFr: "", titleAr: "", links: [] },
                    ],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("addColumn") || "Ajouter colonne"}
              </button>
            </div>

            <div className="space-y-6">
              {(form.columns || []).map((col, cIdx) => (
                <div
                  key={cIdx}
                  className="border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface-muted)] relative group"
                >
                  {/* Column Header */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6 pb-4 border-b border-[var(--color-border)]">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold uppercase opacity-50">
                        {t("titleFr") || "Titre FR"}
                      </label>
                      <input
                        className="field w-full font-semibold"
                        placeholder="Titre Colonne"
                        value={col.titleFr}
                        onChange={(e) =>
                          updateColumn(cIdx, { titleFr: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold uppercase opacity-50">
                        {t("titleAr") || "Titre AR"}
                      </label>
                      <input
                        className="field w-full text-right font-semibold"
                        placeholder="عنوان العمود"
                        value={col.titleAr}
                        onChange={(e) =>
                          updateColumn(cIdx, { titleAr: e.target.value })
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-secondary bg-red-100 text-red-600 border-red-200 hover:bg-red-500 hover:text-white self-end mb-1"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          columns: (prev.columns || []).filter(
                            (_, i) => i !== cIdx
                          ),
                        }))
                      }
                      title={t("deleteColumn")}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Links List */}
                  <div className="space-y-3 pl-0 md:pl-4">
                    {(col.links || []).map((l, lIdx) => (
                      <div
                        key={lIdx}
                        className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center"
                      >
                        <div className="md:col-span-2">
                          <input
                            className="field w-full text-sm py-2"
                            placeholder="Label FR"
                            value={l.labelFr}
                            onChange={(e) =>
                              updateLink(cIdx, lIdx, {
                                labelFr: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            className="field w-full text-sm py-2 text-right"
                            placeholder="Label AR"
                            value={l.labelAr}
                            onChange={(e) =>
                              updateLink(cIdx, lIdx, {
                                labelAr: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            className="field w-full text-sm py-2 font-mono text-xs"
                            placeholder="/url"
                            value={l.href}
                            onChange={(e) =>
                              updateLink(cIdx, lIdx, { href: e.target.value })
                            }
                          />
                        </div>
                        <div className="md:col-span-1 text-right">
                          <button
                            type="button"
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            onClick={() =>
                              updateColumn(cIdx, {
                                links: (col.links || []).filter(
                                  (_, i) => i !== lIdx
                                ),
                              })
                            }
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="mt-4 text-sm font-semibold text-[var(--category-accent)] hover:underline flex items-center gap-2"
                      onClick={() =>
                        updateColumn(cIdx, {
                          links: [
                            ...(col.links || []),
                            { labelFr: "", labelAr: "", href: "" },
                          ],
                        })
                      }
                    >
                      <Plus className="w-4 h-4" />
                      {t("addLink") || "Ajouter un lien"}
                    </button>
                  </div>
                </div>
              ))}

              {(form.columns || []).length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl opacity-50">
                  {t("noColumns") || "Aucune colonne définie."}
                  <br />
                  <span className="text-sm">
                    Cliquez sur "Ajouter colonne" pour commencer.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
