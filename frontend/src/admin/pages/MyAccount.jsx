import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import { getProfile, updateProfile } from "../../api/dataService";
import { Shield, User, Mail, Phone, MapPin, Trash2 } from "lucide-react";

export default function MyAccount() {
  const { user, updateUser, requestEmailVerification } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    wilaya: "",
  });

  const [msg, setMsg] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const json = await getProfile();
        if (active && json?.user) {
          setProfile(json.user);
          setFormData({
            fullName: json.user.fullName || "",
            username: json.user.username || "",
            email: json.user.email || "",
            phone: json.user.phone || "",
            wilaya: json.user.wilaya || "",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const json = await updateProfile(formData);
      if (!json?.success) throw new Error(json?.message || "Erreur");
      setProfile(json.user);
      updateUser(json.user);
      setMsg(t("saved") || "Enregistré.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const resendVerification = async () => {
    if (!formData.email) return;
    const res = await requestEmailVerification(formData.email);
    setMsg(res.message || (res.success ? "Email envoyé" : "Erreur"));
  };

  if (loading) return <div>{t("loading")}</div>;
  if (!profile) return <div>User not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="responsive-title mb-6">
        {t("myAccount") || "Mon Compte"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        {/* Profile Card */}
        <div className="detail-card text-center space-y-4 h-fit">
          <div className="w-24 h-24 mx-auto rounded-full bg-[var(--category-accent)] text-white flex items-center justify-center text-3xl font-bold">
            {(profile.fullName || profile.username || "?")
              .charAt(0)
              .toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-lg">
              {profile.fullName || profile.username}
            </div>
            <div className="text-sm opacity-60">{profile.email}</div>
          </div>
          <div className="pt-4 border-t border-[var(--color-border)] text-sm space-y-2 text-left">
            <div className="flex justify-between">
              <span className="opacity-70">{t("role")}</span>
              <span className="font-semibold uppercase">{profile.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">{t("status")}</span>
              <span
                className={`font-semibold ${
                  profile.verified ? "text-green-500" : "text-amber-500"
                }`}
              >
                {profile.verified ? t("verified") : t("unverified")}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="detail-card space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-[var(--category-accent)]" size={20} />
            <h2 className="text-lg font-bold">{t("information")}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm opacity-70 mb-1 block">
                {t("fullName")}
              </span>
              <input
                className="form-input w-full"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="text-sm opacity-70 mb-1 block">
                {t("username")}
              </span>
              <input
                className="form-input w-full"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="text-sm opacity-70 mb-1 block">
                {t("email")}
              </span>
              <input
                className="form-input w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="text-sm opacity-70 mb-1 block">
                {t("phone")}
              </span>
              <input
                className="form-input w-full"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm opacity-70 mb-1 block">
                {t("wilaya")}
              </span>
              <input
                className="form-input w-full"
                value={formData.wilaya}
                onChange={(e) =>
                  setFormData({ ...formData, wilaya: e.target.value })
                }
              />
            </label>
          </div>

          {!profile.verified && (
            <div className="bg-amber-500/10 p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm text-amber-600 dark:text-amber-400">
                {t("verifyEmailHint")}
              </span>
              <button
                className="btn-secondary text-xs"
                onClick={resendVerification}
              >
                {t("resendEmail")}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            {msg && (
              <span className="text-sm text-[var(--category-accent)]">
                {msg}
              </span>
            )}
            <button
              className="btn-primary ml-auto"
              disabled={saving}
              onClick={save}
            >
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="detail-card mt-6 border-red-200 dark:border-red-900/30">
        <h2 className="text-lg font-bold text-red-600 mb-4">{t("security")}</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-semibold">{t("password")}</div>
            <div className="text-sm opacity-60">{t("passwordResetHint")}</div>
          </div>
          <button
            className="btn-secondary"
            onClick={() => (window.location.href = "/auth/reset-password")}
          >
            {t("resetPassword")}
          </button>
        </div>
        <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-red-600">
              {t("deleteAccount") || "Supprimer le compte"}
            </div>
            <div className="text-sm opacity-60">Action irréversible.</div>
          </div>
          <button className="btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
