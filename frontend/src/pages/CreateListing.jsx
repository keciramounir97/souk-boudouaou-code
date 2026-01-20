import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import { createListing } from "../api/dataService";
import { useTheme } from "../context/themeContext";
import { useTranslation } from "../context/translationContext";
import { useToast } from "../context/ToastContext";
import { useCategoryOptions } from "../hooks/useCategoryOptions";
import IconSelector from "../components/IconSelector";

const ACCEPTED_IMAGE_TYPES =
  ".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif";

function withAlpha(color, amount) {
  const hex = String(color || "").replace("#", "");
  if (hex.length !== 6 && hex.length !== 8) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${amount})`;
}

export default function CreateListing() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { t, language } = useTranslation();
  const toast = useToast();
  const { options: categories } = useCategoryOptions();

  const defaultCategory = useMemo(
    () => categories[0]?.value || "Poulet",
    [categories]
  );

  const [form, setForm] = useState({
    title: "",
    category: defaultCategory,
    wilaya: "",
    listingDate: "",
    breedingDate: "",
    preparationDate: "",
    description: "",
    pricePerKg: "",
    status: "published",
    customFields: [], // Array of { key, label, value, iconName }
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.value === form.category) || categories[0],
    [categories, form.category]
  );
  const accent = selectedCategory?.accent || "var(--color-primary)";
  const clearLabel = t("clear") || (language === "ar" ? "مسح" : "Effacer");
  const currencyLabel = t("da") || (language === "ar" ? "دج" : "DA");
  const dateFormatHint =
    t("dateFormatHint") || (language === "ar" ? "يوم/شهر/سنة" : "jj/mm/aa");

  useEffect(() => {
    if (!form.category && defaultCategory) {
      setForm((prev) => ({ ...prev, category: defaultCategory }));
    }
  }, [defaultCategory, form.category]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addCustomField = () => {
    setForm((prev) => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        { key: "", label: "", value: "", iconName: "Package" },
      ],
    }));
  };

  const updateCustomField = (index, field) => {
    setForm((prev) => {
      const updated = [...prev.customFields];
      updated[index] = { ...updated[index], ...field };
      return { ...prev, customFields: updated };
    });
  };

  const removeCustomField = (index) => {
    setForm((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const addFile = (picked) => {
    const incoming = Array.from(picked || []).filter(Boolean);
    const first = incoming[0] || null;
    if (!first) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!validTypes.includes(first.type)) {
      setFileError(
        t("invalidFileType") ||
          "Type de fichier invalide. Utilisez JPG, PNG, WebP ou AVIF."
      );
      return;
    }

    if (first.size > 10 * 1024 * 1024) {
      setFileError(
        t("fileTooLarge") || "Le fichier est trop volumineux (max 10MB)."
      );
      return;
    }

    setFileError("");
    setFile(first);
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (!form.title?.trim()) {
        throw new Error(t("titleRequired") || "Le titre est requis");
      }

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "customFields") {
          // Handle customFields array
          if (Array.isArray(v) && v.length > 0) {
            fd.append("customFields", JSON.stringify(v.filter(f => f.label && f.value)));
          }
        } else if (v !== "" && v !== null && v !== undefined) {
          fd.append(k, v);
        }
      });

      if (file) {
        fd.append("photo", file);
      }

      const json = await createListing(fd);
      const listing = json?.data?.listing;

      if (json?.success && listing) {
        toast.success(t("listingCreated") || "Annonce créée avec succès!");
        setTimeout(() => {
          navigate(`/listing/${listing.id || listing._id}`);
        }, 1000);
        return;
      }

      throw new Error(json?.message || t("createFailed") || "Échec de la création");
    } catch (err) {
      console.error("Create listing error:", err);
      toast.error(
        err?.message || t("createFailed") || "Échec de la création de l'annonce"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-120px)] bg-[var(--color-surface)] text-[var(--color-text)]"
      style={{ "--category-accent": accent }}
    >
      <div className="responsive-container py-10">
        <div
          className="detail-card category-accent-border-left mb-6 overflow-hidden"
          style={{
            background: `linear-gradient(120deg, ${accent}22, ${accent}08)`,
          }}
        >
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.35),_transparent_35%),radial-gradient(circle_at_80%_0%,_rgba(255,255,255,0.25),_transparent_30%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 category-accent-bg text-white px-3 py-1 text-xs font-semibold">
                {t("createListing") || "Create listing"}
              </div>
              <h1 className="responsive-title">
                {t("createListing") || "Create listing"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => navigate(-1)}
              >
                {t("back") || "Retour"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setForm({
                    title: "",
                    category: defaultCategory,
                    wilaya: "",
                    listingDate: "",
                    breedingDate: "",
                    preparationDate: "",
                    description: "",
                    pricePerKg: "",
                    status: "published",
                  });
                  setFile(null);
                  setPreview("");
                  setFileError("");
                }}
              >
                {clearLabel}
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6"
        >
          <div className="space-y-4">
            <div className="detail-card space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  {(selectedCategory?.icon || selectedCategory?.value || "C")
                    .toString()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide opacity-70 font-semibold">
                    {t("category")}
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedCategory?.label || form.category}
                  </div>
                </div>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label className="block text-sm mb-1 opacity-80" htmlFor="title">
                    {t("title") || "Titre"}
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder={t("titlePlaceholder") || "Ex: Poulet fermier frais"}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm mb-1 opacity-80"
                    htmlFor="category"
                  >
                    {t("category") || "Catégorie"}
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label
                    className="block text-sm mb-1 opacity-80"
                    htmlFor="wilaya"
                  >
                    {t("wilaya") || "Wilaya"}
                  </label>
                  <input
                    id="wilaya"
                    name="wilaya"
                    value={form.wilaya}
                    onChange={onChange}
                    className="form-input"
                    placeholder={t("wilayaPlaceholder") || t("wilaya") || "Wilaya"}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm mb-1 opacity-80"
                    htmlFor="pricePerKg"
                  >
                    {t("price") || "Prix"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      id="pricePerKg"
                      name="pricePerKg"
                      value={form.pricePerKg}
                      onChange={onChange}
                      className="form-input"
                      placeholder={currencyLabel}
                    />
                    <div className="px-3 rounded-md border border-[var(--color-border)] flex items-center text-sm">
                      / {t("kg") || "kg"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm mb-1 opacity-80"
                    htmlFor="listingDate"
                  >
                    {t("listingDate") || "Date d'annonce"}
                  </label>
                  <input
                    type="date"
                    id="listingDate"
                    name="listingDate"
                    value={form.listingDate}
                    onChange={onChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm mb-1 opacity-80"
                    htmlFor="breedingDate"
                  >
                    {t("cycleStart") || "Début du cycle"}
                  </label>
                  <input
                    type="date"
                    id="breedingDate"
                    name="breedingDate"
                    value={form.breedingDate}
                    onChange={onChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm mb-1 opacity-80"
                    htmlFor="preparationDate"
                  >
                    {t("cycleEnd") || "Date de préparation"}
                  </label>
                  <input
                    type="date"
                    id="preparationDate"
                    name="preparationDate"
                    value={form.preparationDate}
                    onChange={onChange}
                    className="form-input"
                  />
                </div>
              </div>
              {dateFormatHint ? (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {dateFormatHint}
                </p>
              ) : null}

              <div>
                <label
                  className="block text-sm mb-1 opacity-80"
                  htmlFor="description"
                >
                  {t("description") || "Description"}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  className="form-textarea min-h-[110px]"
                  placeholder={
                    t("descriptionPlaceholder") ||
                    "Ex: Poulet fermier, frais du jour...\n\nVous pouvez utiliser:\n- Listes à puces\n- **Gras**\n- *Italique*\n- # Titres"
                  }
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {t("descriptionFormatHelp") || "Supporte le texte brut et le formatage Markdown (listes, gras, italique, titres)"}
                </p>
              </div>

              {/* Custom Fields Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold opacity-80">
                    {t("additionalInfo") || "Informations supplémentaires"}
                  </label>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)] transition text-sm"
                    style={{ borderColor: accent }}
                  >
                    <Plus className="w-4 h-4" style={{ color: accent }} />
                    {t("addField") || "Ajouter"}
                  </button>
                </div>

                {form.customFields.length > 0 && (
                  <div className="space-y-3">
                    {form.customFields.map((field, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                            {t("field") || "Champ"} {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCustomField(index)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs mb-1 opacity-70">
                              {t("label") || "Libellé"}
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) =>
                                updateCustomField(index, {
                                  label: e.target.value,
                                  key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                })
                              }
                              className="form-input text-sm"
                              placeholder={t("fieldLabelPlaceholder") || "Ex: Livraison"}
                            />
                          </div>

                          <div>
                            <label className="block text-xs mb-1 opacity-70">
                              {t("value") || "Valeur"}
                            </label>
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) =>
                                updateCustomField(index, { value: e.target.value })
                              }
                              className="form-input text-sm"
                              placeholder={t("fieldValuePlaceholder") || "Ex: Oui / Non"}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs mb-1 opacity-70">
                            {t("icon") || "Icône"}
                          </label>
                          <IconSelector
                            selectedIcon={field.iconName || "Package"}
                            onSelect={(iconName) =>
                              updateCustomField(index, { iconName })
                            }
                            accent={accent}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="detail-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{t("photo") || "Photo"}</div>
                  <div className="text-xs opacity-70">
                    {t("photoHelpSingle") || "1 photo (JPG/PNG/WebP/AVIF)"}
                  </div>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
                  {file ? t("selected") || "Sélectionné" : t("noPhoto") || "Aucune photo"}
                </div>
              </div>

              <div
                className="relative rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] overflow-hidden"
                style={{ boxShadow: `0 10px 30px ${accent}22` }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  onChange={(e) => addFile(e.target.files)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center space-y-3">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 rounded-xl object-cover border border-[var(--color-border)] shadow-sm"
                    />
                  ) : (
                    <div className="text-sm opacity-80">
                      {t("dragDropPhotos") || "Glissez-déposez votre photo ici"}
                    </div>
                  )}
                  {fileError ? (
                    <div className="text-xs text-red-600">{fileError}</div>
                  ) : null}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("choosePhotos") || "Choisir une photo"}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-semibold hover:bg-[var(--color-surface-muted)] transition"
                      onClick={() => {
                        setFile(null);
                        setPreview("");
                      }}
                    >
                      {t("clear") || "Vider"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card space-y-3">
              <div className="responsive-subtitle">{t("summary") || "Résumé"}</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="opacity-70">{t("category")}</span>
                  <span className="font-semibold">{selectedCategory?.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">{t("price")}</span>
                  <span className="font-semibold">
                    {form.pricePerKg ? `${form.pricePerKg} DA` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">{t("wilaya")}</span>
                  <span className="font-semibold">
                    {form.wilaya || t("wilaya") || "—"}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 10px 25px ${withAlpha(accent, 0.25)}`,
                }}
              >
                {loading ? t("loading") || "En cours..." : t("create") || "Créer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

