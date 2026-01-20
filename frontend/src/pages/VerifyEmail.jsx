import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/themeContext";

import { useTranslation } from "../context/translationContext";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function VerifyEmail() {
  const { t } = useTranslation();
  const {
    confirmEmailVerification,
    requestEmailVerification,
    updateUser,
    user,
  } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const query = useQuery();

  const [email, setEmail] = useState(query.get("email") || user?.email || "");
  const [status, setStatus] = useState("idle"); // idle | working | success | error
  const [message, setMessage] = useState("");

  const token = query.get("token") || "";

  useEffect(() => {
    let active = true;
    (async () => {
      if (!email || !token) return;
      setStatus("working");
      const res = await confirmEmailVerification({ email, token });
      if (!active) return;
      if (!res.success) {
        setStatus("error");
        setMessage(res.message || "Verification failed.");
        return;
      }
      setStatus("success");
      setMessage(res.message || "Email verified.");
      try {
        if (user) updateUser({ ...user, verified: true });
      } catch {}
      setTimeout(() => navigate("/auth", { replace: true }), 1200);
    })();
    return () => {
      active = false;
    };
  }, [confirmEmailVerification, email, token, navigate, updateUser, user]);

  const resend = async () => {
    if (!email) return;
    setStatus("working");
    const res = await requestEmailVerification(email);
    if (!res.success) {
      setStatus("error");
      setMessage(res.message || "Failed to send email.");
      return;
    }
    setStatus("idle");
    setMessage(res.message || "Email sent.");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: darkMode
          ? "var(--color-surface-muted)"
          : "var(--color-gray-light)",
      }}
    >
      <div className="detail-card w-full max-w-md">
        <h1 className="responsive-title">Vérification email</h1>
        <p className="mt-2 text-sm opacity-80">
          Entrez votre email puis cliquez sur “Renvoyer”. Ouvrez ensuite le lien
          reçu.
        </p>

        <div className="mt-4">
          <label className="text-sm font-medium opacity-80">
            {t("email") || "Email"}
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input mt-2"
            placeholder="ex: test@tresormaison.com"
          />
        </div>

        {message ? (
          <div
            className={`mt-4 text-sm ${
              status === "error" ? "text-red-600" : "text-[var(--color-text)]"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={status === "working" || !email}
            onClick={resend}
          >
            {status === "working" ? "En cours..." : "Renvoyer"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/auth")}
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
