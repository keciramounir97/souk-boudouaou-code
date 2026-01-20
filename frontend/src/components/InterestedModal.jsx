import React, { useMemo, useState } from "react";

import { createInquiry } from "../api/dataService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/themeContext";
import { useTranslation } from "../context/translationContext";

export default function InterestedModal({ listing, onClose }) {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  const listingId = listing?.id || listing?._id || listing?.slug;
  const title = listing?.title || "";
  const contactPhone = listing?.contactPhone || "";

  const [name, setName] = useState(user?.fullName || user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const requiresIdentity = useMemo(() => !user, [user]);

  const submit = async () => {
    if (!listingId) return;
    if (!message.trim() || message.trim().length < 5) {
      alert(t("messageTooShort") || "Message trop court.");
      return;
    }
    if (requiresIdentity) {
      if (!name.trim()) {
        alert(t("nameRequired") || "Nom requis.");
        return;
      }
      if (!phone.trim()) {
        alert(t("phoneRequired") || "Téléphone requis.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        message: message.trim(),
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      };
      const json = await createInquiry(listingId, payload);
      if (!json?.success) throw new Error(json?.message || "Create failed");
      alert(t("inquirySent") || "Demande envoyée.");
      onClose();
    } catch (e) {
      alert(e?.message || "Erreur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative w-full max-w-lg surface-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xl font-semibold">
              {t("interestedModalTitle") || "Je suis intéressé"}
            </div>
            <div className="text-sm opacity-70 mt-1 truncate">
              {title || t("listing") || "Annonce"}
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose}>
            {t("cancel") || "Annuler"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("fullName") || "Nom"}
            value={name}
            onChange={setName}
            required={requiresIdentity}
          />
          <Field
            label={t("phone") || "Téléphone"}
            value={phone}
            onChange={setPhone}
            required={requiresIdentity}
          />
          <Field
            label={t("email") || "Email"}
            value={email}
            onChange={setEmail}
            type="email"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-1 opacity-80">
            {t("message") || "Message"}
          </label>
          <textarea
            className="field w-full min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              t("messagePlaceholder") ||
              "Ex: Je suis intéressé, merci de me contacter…"
            }
            required
          />
        </div>

        {contactPhone ? (
          <div
            className={`mt-4 rounded-xl border p-4 ${
              darkMode
                ? "border-slate-800 bg-slate-950/40"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="text-sm font-semibold">
              {t("contactPhone") || "Téléphone"}
            </div>
            <div className="text-sm opacity-80 mt-1">{contactPhone}</div>
            <div className="mt-3 flex gap-2">
              <a className="btn-primary flex-1 text-center" href={`tel:${contactPhone}`}>
                {t("callNow") || "Appeler"}
              </a>
              <button
                className="btn-secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(contactPhone);
                    alert(t("copied") || "Copié.");
                  } catch {
                    // ignore
                  }
                }}
              >
                {t("copy") || "Copier"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>
            {t("cancel") || "Annuler"}
          </button>
          <button
            className="btn-primary disabled:opacity-50"
            disabled={saving}
            onClick={submit}
          >
            {saving ? t("saving") || "..." : t("send") || "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="block text-sm mb-1 opacity-80">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        className="field w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </div>
  );
}

