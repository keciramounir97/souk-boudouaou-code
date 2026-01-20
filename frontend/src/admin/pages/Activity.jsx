import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import { getAuditClicks } from "../../api/dataService";

export default function AdminActivity() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === "super_admin";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!isSuperAdmin) return;
      try {
        setLoading(true);
        const res = await getAuditClicks({ page: 1, limit: 100 });
        if (!active) return;
        setRows(res.data?.clicks || []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  const tableRows = useMemo(() => {
    return (rows || []).map((c) => ({
      id: c.id,
      kind: c.kind || "—",
      path: c.path || "—",
      at: c.createdAt ? new Date(c.createdAt).toLocaleString() : "—",
      user: c.user?.email || c.user?.username || "Guest",
      listingId: c.listingId || c.listing?._id || c.listing?.id,
      listing:
        c.listing?.title ||
        c.listing?.slug ||
        (c.listingId ? String(c.listingId) : "—"),
      ip: c.ip || "—",
    }));
  }, [rows]);

  if (!isSuperAdmin) {
    return (
      <div>
        <div className="detail-card text-center py-12">
          <h1 className="responsive-title">{t("accessDenied")}</h1>
          <p className="mt-2 opacity-80 max-w-md mx-auto">
            {t("adminSuperAdminOnly")}
          </p>
          <button
            className="btn-primary mt-6"
            onClick={() => navigate("/admin")}
          >
            {t("back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="responsive-title m-0">{t("adminActivityClicks")}</h1>
          <p className="text-sm opacity-60 mt-1">
            {tableRows.length} {t("adminEventsCount")}
          </p>
        </div>
        <button
          className="btn-secondary sm:w-auto"
          onClick={() => navigate("/admin")}
        >
          {t("back")}
        </button>
      </div>

      <div className="detail-card p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)]">
              <tr>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("adminWhen")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("adminType")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("adminUser")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("listing")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("adminPath")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-12 text-center opacity-70" colSpan={6}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[var(--category-accent)] border-t-transparent rounded-full animate-spin"></div>
                      {t("loading")}
                    </div>
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center opacity-70 italic"
                    colSpan={6}
                  >
                    {t("adminNoEvents")}
                  </td>
                </tr>
              ) : (
                tableRows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap opacity-60 font-mono text-xs">
                      {r.at}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--category-accent)]/10 text-[var(--category-accent)] text-[10px] font-bold uppercase tracking-wider">
                        {r.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.user}</td>
                    <td className="px-4 py-3">
                      {r.listingId ? (
                        <button
                          type="button"
                          className="hover:underline text-[var(--category-accent)] text-left line-clamp-1"
                          onClick={() => navigate(`/listing/${r.listingId}`)}
                        >
                          {r.listing}
                        </button>
                      ) : (
                        <span className="opacity-40 italic">{r.listing}</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 opacity-60 truncate max-w-[150px]"
                      title={r.path}
                    >
                      {r.path}
                    </td>
                    <td className="px-4 py-3 opacity-60 font-mono text-xs">
                      {r.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
