import React, { useState, useEffect } from "react";
import { useTranslation } from "../../context/translationContext";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2 } from "lucide-react";

const DEFAULT_METRICS = [
  { id: "category", label: "Catégorie", active: true },
  { id: "price", label: "Prix", active: true },
  { id: "wilaya", label: "Wilaya", active: true },
  { id: "date", label: "Date", active: true },
];

export default function FiltrationSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Load from localStorage (simulation of backend)
    const stored = localStorage.getItem("filtration_metrics");
    if (stored) {
      setMetrics(JSON.parse(stored));
    } else {
      setMetrics(DEFAULT_METRICS);
    }
    setLoading(false);
  }, []);

  const save = (newMetrics) => {
    setMetrics(newMetrics);
    localStorage.setItem("filtration_metrics", JSON.stringify(newMetrics));
  };

  const toggle = (id) => {
    const next = metrics.map((m) =>
      m.id === id ? { ...m, active: !m.active } : m
    );
    save(next);
  };

  const remove = (id) => {
    if (!confirm(t("confirmDelete") || "Supprimer ?")) return;
    const next = metrics.filter((m) => m.id !== id);
    save(next);
  };

  const add = () => {
    const name = prompt(t("metricName") || "Nom du critère");
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "_");
    const next = [...metrics, { id, label: name, active: true }];
    save(next);
  };

  if (loading) return <div>{t("loading")}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="responsive-title">
          {t("filtrationSettings") || "Filtration Metrics"}
        </h1>
        <button className="btn-primary flex items-center gap-2" onClick={add}>
          <Plus size={16} />
          {t("add") || "Ajouter"}
        </button>
      </div>

      <div className="detail-card">
        <div className="space-y-4">
          {metrics.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 bg-[var(--color-surface-muted)] rounded-lg border border-[var(--color-border)]"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={m.active}
                  onChange={() => toggle(m.id)}
                  className="h-5 w-5 accent-[var(--category-accent)]"
                />
                <div>
                  <div className="font-semibold">
                    {m.label}{" "}
                    <span className="text-xs opacity-50">({m.id})</span>
                  </div>
                </div>
              </div>
              <button
                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                onClick={() => remove(m.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {metrics.length === 0 && (
            <div className="text-center opacity-50 py-8">
              {t("noMetrics") || "Aucun critère de filtration."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
