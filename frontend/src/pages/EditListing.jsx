import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getListingDetails, updateListing } from "../api/dataService";
import { useTheme } from "../context/themeContext";
import { useTranslation } from "../context/translationContext";
import { useToast } from "../context/ToastContext";
import { useCategoryOptions } from "../hooks/useCategoryOptions";
import { normalizeImageUrl } from "../utils/images";

const ACCEPTED_IMAGE_TYPES =
  ".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif";

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const { options: categories } = useCategoryOptions({ includeHidden: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [existingImage, setExistingImage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: categories[0]?.value || "Poulet",
    wilaya: "",
    listingDate: "",
    breedingDate: "",
    description: "",
    details: "",
    preparationDate: "",
    trainingType: "",
    medicationsUsed: "",
    vaccinated: false,
    pricePerKg: "",
    status: "published",
  });

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getListingDetails(id);
        const l = res?.data?.listing;
        if (!active) return;
        if (!res?.success || !l) return;

        const first =
          Array.isArray(l.images) && l.images.length ? l.images[0] : "";
        setExistingImage(first ? normalizeImageUrl(first) : "");

        setForm({
          title: l.title || "",
          category: l.category || "Poulet",
          wilaya: l.wilaya || "",
          listingDate:
            l.listingDate || l.date || l.createdAt
              ? String(l.listingDate || l.date || l.createdAt).substring(0, 10)
              : "",
          breedingDate: l.breedingDate
            ? String(l.breedingDate).substring(0, 10)
            : "",
          description: l.description || l.details || "",
          details: l.details || "",
          preparationDate: l.preparationDate
            ? String(l.preparationDate).substring(0, 10)
            : "",
          trainingType: l.trainingType || l.formationType || "",
          medicationsUsed:
            l.medicationsUsed || l.medicamentsUsed || l.medications || "",
          vaccinated: !!l.vaccinated,
          pricePerKg: l.pricePerKg ?? "",
          status: l.status || "published",
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear errors when user starts typing
  };

  const addFile = (picked) => {
    const incoming = Array.from(picked || []).filter(Boolean);
    const first = incoming[0] || null;
    if (!first) return;

    // Validate file type
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

    // Validate file size (max 10MB)
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

    setSaving(true);

    try {
      // Validate required fields
      if (!form.title?.trim()) {
        throw new Error(t("titleRequired") || "Le titre est requis");
      }

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        // Don't send empty or undefined values
        if (v !== "" && v !== null && v !== undefined) {
          fd.append(k, v);
        }
      });

      if (file) {
        fd.append("photo", file);
      }

      const json = await updateListing(id, fd);

      if (json?.success) {
        toast.success(
          t("listingUpdated") || "Annonce mise à jour avec succès!"
        );
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate(`/listing/${id}`);
        }, 1000);
        return;
      }

      throw new Error(
        json?.message || t("updateFailed") || "Échec de la mise à jour"
      );
    } catch (err) {
      console.error("Update listing error:", err);
      toast.error(
        err?.message ||
          t("updateFailed") ||
          "Échec de la mise à jour de l'annonce"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="animate-spin w-10 h-10 rounded-full border-b-2 border-[var(--color-accent)]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[var(--color-surface)] text-[var(--color-text)]">
      <div className="responsive-container py-8">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="responsive-title">
              {t("editListing") || "Modifier l'annonce"}
            </h1>
            <div className="text-sm opacity-70 mt-1">
              {t("editListingSubtitle") ||
                "Mettez à jour les informations puis enregistrez."}
            </div>
          </div>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => navigate(-1)}
          >
            {t("back") || "Retour"}
          </button>
        </div>

        <form onSubmit={submit} className="detail-card space-y-4">
          {/* Error and Success Messages */}

          <div>
            <label
              className="block text-sm mb-1 opacity-80"
              htmlFor="edit-title"
            >
              {t("title")}
            </label>
            <input
              id="edit-title"
              name="title"
              value={form.title}
              onChange={onChange}
              className="form-input"
              required
            />
          </div>

          <div className="responsive-grid-2">
            <div>
              <label
                className="block text-sm mb-1 opacity-80"
                htmlFor="edit-category"
              >
                {t("category")}
              </label>
              <select
                id="edit-category"
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
            <div>
              <label
                className="block text-sm mb-1 opacity-80"
                htmlFor="edit-wilaya"
              >
                {t("wilaya")}
              </label>
              <input
                id="edit-wilaya"
                name="wilaya"
                value={form.wilaya}
                onChange={onChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="responsive-grid-2">
            <div>
              <label
                className="block text-sm mb-1 opacity-80"
                htmlFor="edit-listingDate"
              >
                {t("listingDate") || "Date"}
              </label>
              <input
                type="date"
                id="edit-listingDate"
                name="listingDate"
                value={form.listingDate}
                onChange={onChange}
                className="form-input"
              />
            </div>

            <div>
              <label
                className="block text-sm mb-1 opacity-80"
                htmlFor="edit-breedingDate"
              >
                {t("cycleStart") || "Debut du cycle"}
              </label>
              <input
                type="date"
                id="edit-breedingDate"
                name="breedingDate"
                value={form.breedingDate}
                onChange={onChange}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm mb-1 opacity-80"
              htmlFor="edit-description"
            >
              {t("description")}
            </label>
            <textarea
              id="edit-description"
              name="description"
              value={form.description}
              onChange={onChange}
              className="form-textarea min-h-[110px]"
            />
          </div>

          <div>
            <label
              className="block text-sm mb-1 opacity-80"
              htmlFor="edit-details"
            >
              {t("details")}
            </label>
            <textarea
              id="edit-details"
              name="details"
              value={form.details}
              onChange={onChange}
              className="form-textarea min-h-[90px]"
            />
          </div>

          <div className="responsive-grid-2">
            <div>
              <label
                className="block text-sm mb-1 opacity-80"
                htmlFor="edit-preparationDate"
              >
                {t("cycleEnd")}
              </label>
              <input
                type="date"
                id="edit-preparationDate"
                name="preparationDate"
                value={form.preparationDate}
                onChange={onChange}
                className="form-input"
              />
            </div>
            <div>
              <label
                className="block text-sm mb-1 opacity-80"
                htmlFor="edit-pricePerKg"
              >
                {t("price")}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                id="edit-pricePerKg"
                name="pricePerKg"
                value={form.pricePerKg}
                onChange={onChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="responsive-grid-2">
            <div>
              <label className="block text-sm mb-1 opacity-80">
                {t("trainingType") || "Type de formation"}
              </label>
              <input
                name="trainingType"
                value={form.trainingType}
                onChange={onChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 opacity-80">
                {t("medicationsUsed") || "Medicaments utilises"}
              </label>
              <input
                name="medicationsUsed"
                value={form.medicationsUsed}
                onChange={onChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                name="vaccinated"
                checked={!!form.vaccinated}
                onChange={onChange}
              />
              {t("vaccinated")}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">{t("status")}</span>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="form-select"
              >
                <option value="published">{t("published")}</option>
                <option value="draft">{t("draft")}</option>
              </select>
            </div>
          </div>

          <div className="surface-muted p-4">
            <div className="text-sm font-semibold">{t("photo")}</div>
            <div className="text-sm opacity-70 mt-1">
              {t("editPhotoHelp") || "Remplacer la photo (optionnel)."}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold opacity-80">
                  {t("currentPhoto") || "Actuelle"}
                </div>
                <div className="mt-2 rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
                  {existingImage ? (
                    <img
                      src={existingImage}
                      alt=""
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-sm opacity-70">
                      {t("noPhoto") || "Aucune photo"}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold opacity-80">
                  {t("newPhoto") || "Nouvelle"}
                </div>
                <div
                  className={`mt-2 rounded-xl border border-dashed p-4 transition-colors ${
                    darkMode
                      ? "border-slate-700 bg-slate-950/40"
                      : "border-slate-300 bg-white"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    addFile(e.dataTransfer.files);
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      {t("choosePhoto") || "Choisir"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                    >
                      {t("takePhoto") || "Caméra"}
                    </button>
                    {file ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setFile(null)}
                      >
                        {t("remove") || "Supprimer"}
                      </button>
                    ) : null}
                  </div>

                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    onChange={(e) => {
                      addFile(e.target.files);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    className="hidden"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    capture="environment"
                    onChange={(e) => {
                      addFile(e.target.files);
                      if (cameraInputRef.current)
                        cameraInputRef.current.value = "";
                    }}
                  />

                  {fileError ? (
                    <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                      {fileError}
                    </div>
                  ) : null}

                  {file ? (
                    <div className="mt-3 rounded-xl overflow-hidden border border-[var(--color-border)]">
                      <img
                        src={preview}
                        alt=""
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2 text-xs opacity-70 truncate">
                        {file.name}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm opacity-70">
                      {t("photoHelpSingle") ||
                        "1 photo (JPG/JPEG/PNG/WebP/AVIF)."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              className="btn-secondary"
              type="button"
              onClick={() => navigate(-1)}
            >
              {t("cancel")}
            </button>
            <button
              disabled={saving}
              className="btn-primary disabled:opacity-50"
              type="submit"
            >
              {saving ? t("saving") || "..." : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
