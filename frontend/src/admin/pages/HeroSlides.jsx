import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import {
  adminAddHeroSlide,
  adminDeleteHeroSlide,
  adminGetHeroSlides,
  adminUpdateHeroSlides,
} from "../../api/dataService";
import { useTranslation } from "../../context/translationContext";
import { normalizeImageUrl } from "../../utils/images";
import { useToast } from "../../context/ToastContext";

function clampInt(value, min, max, defaultVal) {
  const num = Number(value);
  if (!Number.isFinite(num)) return defaultVal;
  return Math.round(Math.max(min, Math.min(max, num)));
}

export default function HeroSlides() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({ slides: [] });

  const [file, setFile] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(6);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const json = await adminGetHeroSlides();
        const slides = json?.data?.slides || json?.data?.hero_slides || json?.hero_slides || [];
        if (active) setSettings({ slides });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        slides: settings.slides.map((s) => ({
          id: s.id,
          url: s.url || s.imageUrl, // Backend expects 'url', not 'imageUrl'
          durationMs: s.durationMs,
        })),
      };
      const json = await adminUpdateHeroSlides(payload);
      if (!json?.success) throw new Error(json?.message || "Save failed");
      toast.success(t("savedSuccessfully") || "Sauvegardé avec succès");

      const slides = json?.data?.slides || json?.data?.hero_slides?.slides || json?.hero_slides?.slides || json?.data?.hero_slides || json?.hero_slides || payload.slides;
      setSettings({ slides: Array.isArray(slides) ? slides : (slides?.slides || payload.slides) });
    } catch (e) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const normalizedSlides = (settings?.slides || []).map((s, idx) => ({
    ...s,
    url: s.url || s.imageUrl, // Preserve url for backend
    imageUrl: normalizeImageUrl(s.imageUrl || s.url), // Use for display
    durationSeconds: Math.round((s.durationMs || 6000) / 1000),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="responsive-title">
            {t("adminTitleHeroSlides") || "Hero Slides"}
          </h1>
          <p className="text-sm opacity-60 mt-1">
            {t("adminHeroSlidesHint") || "Gérez les slides du carrousel."}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate("/admin")}>
            {t("adminNavDashboard")}
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            disabled={saving}
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 opacity-50">{t("loading")}</div>
      ) : (
        <div className="space-y-6">
          <div className="detail-card space-y-4">
            <h2 className="responsive-subtitle border-b border-[var(--color-border)] pb-3 mb-0">
              {t("addSlide") || "Ajouter une slide"}
            </h2>
            <div className="responsive-grid-2">
              <div>
                <label className="text-xs font-bold uppercase opacity-50 mb-2 block">
                  {t("image") || "Image"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="field"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50 mb-2 block">
                  {t("duration") || "Durée (s)"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationSeconds}
                  className="field"
                  onChange={(e) =>
                    setDurationSeconds(clampInt(e.target.value, 1, 600, 6))
                  }
                />
              </div>
            </div>
            <button
              className="btn-primary flex items-center gap-2"
              disabled={!file || uploading}
              onClick={async () => {
                if (!file) return;
                setUploading(true);
                try {
                  const json = await adminAddHeroSlide({
                    file,
                    durationSeconds: clampInt(durationSeconds, 1, 600, 6),
                  });
                  if (!json?.success)
                    throw new Error(json?.message || "Upload failed");

                  toast.success(t("slideAdded") || "Slide ajoutée");

                  const slides = json?.data?.slides || json?.data?.hero_slides?.slides || json?.hero_slides?.slides || json?.data?.hero_slides || json?.hero_slides || [];
                  setSettings({ slides: Array.isArray(slides) ? slides : (slides?.slides || []) });
                  setFile(null);
                  setDurationSeconds(6);
                } catch (e) {
                  toast.error(e?.message || "Upload failed");
                } finally {
                  setUploading(false);
                }
              }}
            >
              <Plus className="w-4 h-4" />
              {uploading ? t("uploading") : t("add")}
            </button>
          </div>

          <div className="detail-card">
            <h2 className="responsive-subtitle border-b border-[var(--color-border)] pb-3 mb-4">
              {t("currentSlides") || "Slides actuelles"}{" "}
              <span className="opacity-50 text-sm font-normal">
                ({normalizedSlides.length})
              </span>
            </h2>

            <div className="space-y-4">
              {normalizedSlides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="border border-[var(--color-border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-[var(--color-surface-muted)]">
                    <img
                      src={s.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all"
                        onClick={async () => {
                          if (!confirm(t("confirmDelete") || "Supprimer ?"))
                            return;
                          try {
                            const json = await adminDeleteHeroSlide(s.id);
                            if (!json?.success)
                              throw new Error(json?.message || "Delete failed");

                            toast.success(
                              t("slideDeleted") || "Slide supprimée"
                            );

                            const slides = json?.data?.slides || json?.data?.hero_slides?.slides || json?.hero_slides?.slides || json?.data?.hero_slides || json?.hero_slides || [];
                            setSettings({
                              slides: Array.isArray(slides) ? slides : (slides?.slides || []),
                            });
                          } catch (e) {
                            toast.error(e?.message || "Delete failed");
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block">
                        {t("duration") || "Durée (s)"}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={600}
                        value={s.durationSeconds}
                        className="field py-1 px-3 w-20 text-center font-bold"
                        onChange={(e) => {
                          const next = clampInt(e.target.value, 1, 600, 6);
                          setSettings((prev) => ({
                            ...prev,
                            slides: prev.slides.map((x, i) =>
                              i === idx ? { ...x, durationMs: next * 1000 } : x
                            ),
                          }));
                        }}
                      />
                    </div>

                    <div className="flex items-center bg-[var(--color-surface-muted)] rounded-lg p-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx === 0) return;
                          setSettings((prev) => {
                            const copy = [...prev.slides];
                            const tmp = copy[idx - 1];
                            copy[idx - 1] = copy[idx];
                            copy[idx] = tmp;
                            return { ...prev, slides: copy };
                          });
                        }}
                        className="p-2 hover:bg-[var(--color-surface)] rounded-md disabled:opacity-30 transition-all"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
                      <button
                        type="button"
                        disabled={idx === normalizedSlides.length - 1}
                        onClick={() => {
                          if (idx === normalizedSlides.length - 1) return;
                          setSettings((prev) => {
                            const copy = [...prev.slides];
                            const tmp = copy[idx + 1];
                            copy[idx + 1] = copy[idx];
                            copy[idx] = tmp;
                            return { ...prev, slides: copy };
                          });
                        }}
                        className="p-2 hover:bg-[var(--color-surface)] rounded-md disabled:opacity-30 transition-all"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {normalizedSlides.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl opacity-50">
                <p className="m-0 italic font-medium">
                  {t("noSlides") || "Aucune slide active."}
                </p>
                <p className="text-sm mt-2">
                  {t("addSlideHint") ||
                    "Utilisez le formulaire ci-dessus pour ajouter des images."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
