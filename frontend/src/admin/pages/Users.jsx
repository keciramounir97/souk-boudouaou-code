import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import {
  adminCreateUser,
  adminDeleteUser,
  adminUpdateUser,
  getAdminUsers,
} from "../../api/dataService";
import { useToast } from "../../context/ToastContext";

export default function AdminUsers() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const isSuperAdmin = user?.role === "super_admin";

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [rows, setRows] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    role: "user",
    verified: true,
    isActive: true,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!isSuperAdmin) return;
      try {
        setLoading(true);
        const params = {
          page: 1,
          limit: 100,
          q: q || undefined,
          role: role || undefined,
          isActive: isActive === "" ? undefined : isActive === "true",
        };
        const res = await getAdminUsers(params);
        if (!active) return;
        setRows(res.data?.users || []);
      } catch (err) {
        console.error(err);
        toast.error(t("loadFailed") || "Erreur de chargement");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isSuperAdmin, q, role, isActive]);

  const tableRows = useMemo(() => {
    return (rows || []).map((row) => ({
      id: row.id,
      fullName: row.fullName || "—",
      email: row.email || "—",
      username: row.username || "—",
      role: row.role || "user",
      isActive: row.isActive !== false,
      verified: row.verified === true,
      createdAt: row.createdAt
        ? new Date(row.createdAt).toLocaleDateString()
        : "—",
    }));
  }, [rows]);

  if (!isSuperAdmin) {
    return (
      <div>
        <div className="detail-card">
          <h1 className="responsive-title text-red-500">{t("accessDenied")}</h1>
          <p className="opacity-70">{t("adminSuperAdminOnly")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="responsive-title mb-0">{t("adminUsers")}</h1>
          <p className="text-sm opacity-60">
            {tableRows.length} {t("adminUsersCount")}
          </p>
        </div>
        <button
          className="btn-primary py-2.5 px-6 flex items-center gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          {t("add")}
        </button>
      </div>

      <div className="detail-card">
        <div className="responsive-grid-2 md:grid-cols-3">
          <div className="relative group">
            <input
              className="form-input pl-10"
              placeholder={t("adminUsersSearchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <select
            className="form-select font-medium"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">{t("adminUsersAllRoles")}</option>
            <option value="user">user</option>
            <option value="ADMIN">ADMIN</option>
            <option value="super_admin">super_admin</option>
          </select>
          <select
            className="form-select font-medium"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
          >
            <option value="">{t("adminUsersAllStatuses")}</option>
            <option value="true">{t("active")}</option>
            <option value="false">{t("inactive")}</option>
          </select>
        </div>
      </div>

      <div className="detail-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)]">
              <tr>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("email")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("fullNameLabel")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("username")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("role")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("status")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("verified")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("createdAt")}
                </th>
                <th className="text-right px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-12 text-center" colSpan={8}>
                    <div className="inline-block w-6 h-6 border-2 border-[var(--category-accent)] border-t-transparent rounded-full animate-spin"></div>
                    <div className="mt-2 text-xs opacity-50 font-medium">
                      {t("loading")}
                    </div>
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center opacity-40 italic"
                    colSpan={8}
                  >
                    {t("adminNoUsers")}
                  </td>
                </tr>
              ) : (
                tableRows.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 opacity-80 whitespace-nowrap">
                      {u.fullName}
                    </td>
                    <td className="px-4 py-3 opacity-60 font-mono text-xs">
                      {u.username}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="form-select text-[10px] font-bold uppercase tracking-tight py-1 bg-[var(--color-surface)] border-[var(--color-border)] w-32"
                        value={u.role}
                        disabled={u.role === "super_admin"}
                        onChange={async (e) => {
                          const nextRole = e.target.value;
                          const json = await adminUpdateUser(u.id, {
                            role: nextRole,
                          });
                          if (!json?.success) {
                            return toast.error(
                              json?.message || "Update failed"
                            );
                          }
                          toast.success(
                            t("savedSuccessfully") || "Rôle mis à jour"
                          );
                          setRows((prev) =>
                            (prev || []).map((x) =>
                              x.id === u.id ? { ...x, ...json.data.user } : x
                            )
                          );
                        }}
                      >
                        <option value="user">user</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-600 hover:text-white"
                            : "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-600 hover:text-white"
                        }`}
                        disabled={u.role === "super_admin"}
                        onClick={async () => {
                          const next = !u.isActive;
                          const json = await adminUpdateUser(u.id, {
                            isActive: next,
                          });
                          if (!json?.success) {
                            return toast.error(
                              json?.message || "Update failed"
                            );
                          }
                          toast.success(
                            next
                              ? t("userActivated") || "Utilisateur activé"
                              : t("userDeactivated") || "Utilisateur désactivé"
                          );
                          setRows((prev) =>
                            (prev || []).map((x) =>
                              x.id === u.id ? { ...x, ...json.data.user } : x
                            )
                          );
                        }}
                      >
                        {u.isActive ? t("deactivate") : t("activate")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.verified ? "text-blue-500" : "opacity-40"
                        }`}
                      >
                        {u.verified ? t("yes") : t("no")}
                      </span>
                    </td>
                    <td className="px-4 py-3 opacity-60 text-[10px] whitespace-nowrap">
                      {u.createdAt}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="btn-secondary text-red-500 border-red-500/10 hover:bg-red-500 hover:text-white py-1 px-3 text-[10px] font-bold uppercase tracking-wider"
                        disabled={u.role === "super_admin"}
                        onClick={async () => {
                          if (!confirm(t("adminUsersDeleteConfirm"))) return;
                          const json = await adminDeleteUser(u.id);
                          if (!json?.success) {
                            return toast.error(
                              json?.message || "Delete failed"
                            );
                          }
                          toast.success(
                            t("userDeleted") || "Utilisateur supprimé"
                          );
                          setRows((prev) =>
                            (prev || []).filter((x) => x.id !== u.id)
                          );
                        }}
                      >
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
            onClick={() => setCreateOpen(false)}
          />
          <div className="relative w-full max-w-lg detail-card shadow-2xl scale-in-center">
            <div className="flex items-start justify-between gap-3 mb-8">
              <div>
                <h2 className="responsive-title text-xl mb-0">
                  {t("adminUsersCreateTitle")}
                </h2>
                <p className="text-xs opacity-60 mt-1">
                  {t("adminUsersCreateHint")}
                </p>
              </div>
              <button
                className="btn-secondary p-1.5"
                onClick={() => setCreateOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label={t("email")}
                value={createForm.email}
                onChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, email: value }))
                }
              />
              <Field
                label={t("password")}
                type="password"
                value={createForm.password}
                onChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, password: value }))
                }
              />
              <Field
                label={t("fullNameLabel")}
                value={createForm.fullName}
                onChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, fullName: value }))
                }
              />
              <Field
                label={t("adminUsersUsernameOptional")}
                value={createForm.username}
                onChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, username: value }))
                }
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-60">
                  {t("role")}
                </label>
                <select
                  className="form-select"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  <option value="user">user</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex flex-col gap-4 pt-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--category-accent)] focus:ring-[var(--category-accent)]"
                    checked={createForm.verified}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        verified: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {t("emailVerified")}
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--category-accent)] focus:ring-[var(--category-accent)]"
                    checked={createForm.isActive}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {t("active")}
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
              <button
                className="btn-secondary px-8 py-2.5"
                onClick={() => setCreateOpen(false)}
              >
                {t("cancel")}
              </button>
              <button
                className="btn-primary px-10 py-2.5 disabled:opacity-50"
                disabled={creating || !createForm.email || !createForm.password}
                onClick={async () => {
                  setCreating(true);
                  try {
                    const payload = {
                      email: createForm.email,
                      password: createForm.password,
                      role: createForm.role,
                      verified: createForm.verified,
                      isActive: createForm.isActive,
                      fullName: createForm.fullName || undefined,
                      username: createForm.username || undefined,
                    };
                    const json = await adminCreateUser(payload);
                    if (!json?.success) {
                      return toast.error(json?.message || "Create failed");
                    }
                    const created = json.data?.user;
                    if (created) setRows((prev) => [created, ...(prev || [])]);
                    toast.success(t("userCreated") || "Utilisateur créé");
                    setCreateOpen(false);
                    setCreateForm({
                      email: "",
                      username: "",
                      fullName: "",
                      password: "",
                      role: "user",
                      verified: true,
                      isActive: true,
                    });
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                {creating ? t("saving") : t("create")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider opacity-60">
        {label}
      </label>
      <input
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </div>
  );
}
