import React, { useEffect, useState } from "react";
import { useTranslation } from "../context/translationContext";
import { getOrders } from "../api/dataService";
import { normalizeImageUrl } from "../utils/images";

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ interested: 0, calls: 0 });

  useEffect(() => {
    (async () => {
      const json = await getOrders();
      const list = (json.data || []).map((o) => ({
        ...o,
        photo: normalizeImageUrl(o.photo),
      }));
      setOrders(list);
      setStats({
        interested: list.length,
        calls: list.reduce((acc, o) => acc + Number(o.callCount || 0), 0),
      });
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)] text-[var(--color-text)]">
      <div className="responsive-container py-8 space-y-6">
        <div className="detail-card">
          <div className="text-sm font-semibold text-[var(--category-accent)]">
            {t("myOrders") || "Mes commandes"}
          </div>
          <h1 className="responsive-title mt-1">Réception des commandes</h1>
          <p className="text-sm opacity-70">
            Vue simplifiée : nombre d'intéressés et appels au centre.
          </p>

          <div className="responsive-grid-2 mt-4">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="text-xs uppercase opacity-70">
                {t("interested") || "Intéressés"}
              </div>
              <div className="text-2xl font-bold mt-1">{stats.interested}</div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="text-xs uppercase opacity-70">Appels centre</div>
              <div className="text-2xl font-bold mt-1">{stats.calls}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
