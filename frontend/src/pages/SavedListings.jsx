import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react";
import { useTranslation } from "../context/translationContext";
import { useCategoryOptions } from "../hooks/useCategoryOptions";
import { normalizeImageUrl } from "../utils/images";

const STORAGE_KEY = "saved_listings_v1";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function SavedListings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { options: categories, accentFor } = useCategoryOptions({
    includeHidden: true,
  });

  const [saved, setSaved] = useState(loadSaved);

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const accent = useMemo(
    () => categories?.[0]?.accent || "var(--category-accent)",
    [categories]
  );

  const removeSaved = (id) => {
    const next = saved.filter(
      (item) => String(item.id || item._id) !== String(id)
    );
    setSaved(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div
      className="min-h-screen bg-[var(--color-surface-muted)] text-[var(--color-text)]"
      style={{ "--category-accent": accent }}
    >
      <div className="responsive-container py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 category-accent-bg text-white px-3 py-1 text-xs font-semibold">
              {t("savedListingsTitle") || "Annonces sauvegardees"}
            </div>
            <h1 className="responsive-title mt-2">
              {t("savedListingsSubtitle") || "Vos favoris en un seul endroit"}
            </h1>
          </div>
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back") || "Retour"}
          </button>
        </div>

        {saved.length === 0 ? (
          <div className="detail-card text-sm">
            {t("savedListingsEmpty") ||
              "Aucune annonce sauvegardee pour l'instant."}
          </div>
        ) : (
          <div className="listing-grid">
            {saved.map((item) => {
              const image =
                normalizeImageUrl(item.image) ||
                normalizeImageUrl(item.images?.[0]);
              const catAccent = accentFor(item.category) || accent;
              return (
                <div
                  key={item.id || item._id}
                  className="listing-card"
                  style={{ borderLeft: `4px solid ${catAccent}` }}
                >
                  <div className="aspect-[4/3] bg-[var(--color-surface-muted)]">
                    {image ? (
                      <img
                        src={image}
                        alt={item.title || "Listing"}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="listing-card-body space-y-2 flex-1 flex flex-col">
                    <div
                      className="inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 text-white"
                      style={{ backgroundColor: catAccent }}
                    >
                      {item.category || "Categorie"}
                    </div>
                    <div
                      className="listing-title line-clamp-2"
                      style={{ color: catAccent }}
                    >
                      {item.title || "Annonce"}
                    </div>
                    {item.price ? (
                      <div className="listing-price">{item.price} DA</div>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <button
                        className="btn-primary text-sm"
                        style={{
                          background: catAccent,
                          borderColor: catAccent,
                        }}
                        onClick={() =>
                          navigate(`/listing/${item.id || item._id}`)
                        }
                      >
                        {t("view") || "Voir"}
                      </button>
                      <button
                        className="btn-secondary text-sm flex items-center gap-2"
                        onClick={() => removeSaved(item.id || item._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t("delete") || "Supprimer"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
