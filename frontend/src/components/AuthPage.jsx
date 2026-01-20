/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/translationContext";
import { useTheme } from "../context/themeContext";
import { useCategories } from "../context/categoryContext";
import { useNavigate } from "react-router-dom";

import { Mail, User2, KeyRound, Lock, AtSign, Eye, EyeOff } from "lucide-react";
import Logo from "./Logo";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [resetStep, setResetStep] = useState("request"); // request | verify | reset

  const { login, signup, forgotPassword, verifyOtp, resetPassword } = useAuth();
  const { t, rtl } = useTranslation();
  const { darkMode } = useTheme();
  const { visibleCategories } = useCategories();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");

  const [loading, setLoading] = useState(false);

  const accent = useMemo(
    () => visibleCategories?.[0]?.accent || "var(--category-accent)",
    [visibleCategories]
  );
  const accentSoft = useMemo(() => {
    const hex = String(accent || "").replace("#", "");
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.14)`;
    }
    return "rgba(255, 138, 29, 0.14)";
  }, [accent]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!identifier || !loginPassword) {
      return alert(t("loginMissingFields") || "Email/username et mot de passe requis");
    }

    setLoading(true);
    try {
      const res = await login({ identifier, password: loginPassword });
      setLoading(false);

      if (!res.success) {
        return alert(res.message || "Échec de la connexion");
      }
      // Redirect to admin if admin user
      if (res.user?.role === "ADMIN" || res.user?.role === "super_admin") {
        return navigate("/admin");
      }
      return navigate("/");
    } catch (error) {
      setLoading(false);
      return alert(error?.message || "Erreur lors de la connexion");
    }
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    if (!username || !email || !signupPassword || !signupConfirm) {
      return alert(t("signupMissingFields") || "Tous les champs sont requis");
    }
    if (signupPassword !== signupConfirm) {
      return alert(t("passwordMismatch") || "Les mots de passe ne correspondent pas");
    }
    if (signupPassword.length < 8) {
      return alert(t("passwordTooShort") || "Le mot de passe doit contenir au moins 8 caractères");
    }

    setLoading(true);
    try {
      const res = await signup({
        username,
        email,
        password: signupPassword,
        fullName: fullName || undefined,
        wilaya: wilaya || undefined,
      });
      setLoading(false);

      if (!res.success) return alert(res.message || "Échec de l'inscription");
      if (res.user?.verified === false) {
        alert(t("verifyEmailSent") || "Email de vérification envoyé");
        return navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      }
      // Redirect to admin if admin user
      if (res.user?.role === "ADMIN" || res.user?.role === "super_admin") {
        return navigate("/admin");
      }
      return navigate("/");
    } catch (error) {
      setLoading(false);
      return alert(error?.message || "Erreur lors de l'inscription");
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!resetEmail) return alert(t("emailRequired") || "Email requis");
    setLoading(true);
    try {
      const res = await forgotPassword(resetEmail);
      setLoading(false);

      if (!res.success) return alert(res.message || "Erreur");
      alert(t("otpSent") || "Code OTP envoyé");
      setResetStep("verify");
    } catch (error) {
      setLoading(false);
      alert(error?.message || "Erreur");
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp) return alert(t("otpRequired") || "Code OTP requis");
    setLoading(true);
    try {
      const res = await verifyOtp(resetEmail, otp);
      setLoading(false);

      if (!res.success) return alert(res.message || "Erreur");
      alert(t("otpVerified") || "Code OTP vérifié");
      setResetStep("reset");
    } catch (error) {
      setLoading(false);
      alert(error?.message || "Erreur");
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!resetEmail || !otp || !resetPasswordValue || !resetConfirm) {
      return alert(t("resetMissingFields") || "Tous les champs sont requis");
    }
    if (resetPasswordValue !== resetConfirm) {
      return alert(t("passwordMismatch") || "Les mots de passe ne correspondent pas");
    }
    if (resetPasswordValue.length < 8) {
      return alert(t("passwordTooShort") || "Le mot de passe doit contenir au moins 8 caractères");
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: resetEmail,
        otp,
        password: resetPasswordValue,
      });
      setLoading(false);

      if (!res.success) return alert(res.message || "Erreur");
      alert(res.message || "Mot de passe réinitialisé avec succès");
      setMode("login");
      setResetStep("request");
      setResetEmail("");
      setOtp("");
      setResetPasswordValue("");
      setResetConfirm("");
    } catch (error) {
      setLoading(false);
      alert(error?.message || "Erreur");
    }
  };

  const handleForgotSubmit = (event) => {
    event.preventDefault();
    if (resetStep === "request") {
      handleSendOtp(event);
    } else if (resetStep === "verify") {
      handleVerifyOtp(event);
    } else {
      handleResetPassword(event);
    }
  };

  const title =
    mode === "login"
      ? t("login")
      : mode === "signup"
      ? t("signup")
      : resetStep === "reset"
      ? t("resetPassword")
      : t("forgotPassword");

  return (
    <div
      className="min-h-screen flex justify-center items-center px-4 py-10"
      style={{
        direction: rtl ? "rtl" : "ltr",
        background: "var(--color-surface-muted)",
        "--category-accent": accent,
      }}
    >
      <div className="w-full max-w-md surface-card p-6 sm:p-8 relative overflow-hidden rounded-[16px] border border-[var(--color-border)] shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
            style={{ background: accentSoft }}
          />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/18 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col items-center gap-3 mb-6">
            <Logo
              alt="Trésor Maison"
              className="h-20 sm:h-24 md:h-32 w-auto object-contain"
            />
          </div>

          {mode !== "forgot" && (
            <div className="flex mb-6">
              {["login", "signup"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setMode(tab);
                    setResetStep("request");
                  }}
                  className={`
                    flex-1 py-2 mx-1 rounded-lg text-sm font-semibold transition-all
                    ${
                      mode === tab
                        ? "text-white scale-[1.03] shadow-md"
                        : "text-[var(--color-text-muted)] hover:opacity-90 bg-[var(--color-surface-muted)]"
                    }
                  `}
                  style={
                    mode === tab
                      ? { background: accent }
                      : { border: "1px solid var(--color-border)" }
                  }
                >
                  {t(tab)}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4 animate-fadeSlide">
            {mode === "login" && (
              <form
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <InputField
                  id="login-identifier"
                  name="identifier"
                  label={t("emailOrUsername")}
                  icon={AtSign}
                  value={identifier}
                  onChange={setIdentifier}
                  placeholder={t("emailOrUsername")}
                  rtl={rtl}
                />
                <InputField
                  id="login-password"
                  name="password"
                  label={t("password")}
                  icon={Lock}
                  type="password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder={t("password")}
                  rtl={rtl}
                  showToggle
                />
                <Button
                  label={t("login")}
                  loading={loading}
                  onClick={(e) => handleLogin(e)}
                  type="submit"
                />
              </form>
            )}
            {mode === "login" && (
              <div className="text-center text-sm opacity-80">
                <button
                  type="button"
                  className="text-orange-500 underline"
                  onClick={() => {
                    setMode("forgot");
                    setResetStep("request");
                    setResetEmail(email || "");
                  }}
                >
                  {t("forgotPassword")}
                </button>
              </div>
            )}

            {mode === "signup" && (
              <form
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <InputField
                  id="signup-fullname"
                  name="fullName"
                  label={t("fullName")}
                  icon={User2}
                  value={fullName}
                  onChange={setFullName}
                  placeholder={t("fullName")}
                  rtl={rtl}
                />
                <InputField
                  id="signup-wilaya"
                  name="wilaya"
                  label={t("wilaya")}
                  icon={User2}
                  value={wilaya}
                  onChange={setWilaya}
                  placeholder={t("wilaya")}
                  rtl={rtl}
                />
                <InputField
                  id="signup-username"
                  name="username"
                  label={t("username")}
                  icon={User2}
                  value={username}
                  onChange={setUsername}
                  placeholder={t("username")}
                  rtl={rtl}
                />
                <InputField
                  id="signup-email"
                  name="email"
                  label={t("email")}
                  icon={Mail}
                  value={email}
                  onChange={setEmail}
                  placeholder={t("email")}
                  type="email"
                  rtl={rtl}
                />
                <InputField
                  id="signup-password"
                  name="password"
                  label={t("password")}
                  icon={Lock}
                  type="password"
                  value={signupPassword}
                  onChange={setSignupPassword}
                  placeholder={t("password")}
                  rtl={rtl}
                  showToggle
                />
                <InputField
                  id="signup-confirm"
                  name="confirmPassword"
                  label={t("confirmPassword")}
                  icon={Lock}
                  type="password"
                  value={signupConfirm}
                  onChange={setSignupConfirm}
                  placeholder={t("confirmPassword")}
                  rtl={rtl}
                  showToggle
                />
                <Button
                  label={t("signup")}
                  loading={loading}
                  onClick={(e) => handleSignup(e)}
                  type="submit"
                />
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <InputField
                  id="forgot-email"
                  name="email"
                  label={t("email")}
                  icon={Mail}
                  value={resetEmail}
                  onChange={setResetEmail}
                  placeholder={t("email")}
                  type="email"
                  disabled={resetStep !== "request"}
                  rtl={rtl}
                />
                {resetStep === "request" ? (
                  <div className="text-xs opacity-70 -mt-2">
                    {t("passwordResetHint")}
                  </div>
                ) : null}
                {resetStep === "request" && (
                  <Button
                    label={t("sendOtp")}
                    loading={loading}
                    onClick={(e) => handleSendOtp(e)}
                    type="submit"
                  />
                )}

                {resetStep !== "request" && (
                  <InputField
                    id="forgot-otp"
                    name="otp"
                    label={t("otp")}
                    icon={KeyRound}
                    value={otp}
                    onChange={setOtp}
                    placeholder={t("otp")}
                    rtl={rtl}
                  />
                )}

                {resetStep === "verify" && (
                  <Button
                    label={t("verifyOtp")}
                    loading={loading}
                    onClick={(e) => handleVerifyOtp(e)}
                    type="submit"
                  />
                )}

                {resetStep === "reset" && (
                  <>
                    <InputField
                      id="reset-password"
                      name="password"
                      label={t("newPassword")}
                      icon={Lock}
                      type="password"
                      value={resetPasswordValue}
                      onChange={setResetPasswordValue}
                      placeholder={t("newPassword")}
                      rtl={rtl}
                      showToggle
                    />
                    <InputField
                      id="reset-confirm"
                      name="confirmPassword"
                      label={t("confirmPassword")}
                      icon={Lock}
                      type="password"
                      value={resetConfirm}
                      onChange={setResetConfirm}
                      placeholder={t("confirmPassword")}
                      rtl={rtl}
                      showToggle
                    />
                    <Button
                      label={t("resetPassword")}
                      loading={loading}
                      onClick={(e) => handleResetPassword(e)}
                      type="submit"
                    />
                  </>
                )}

                <div className="text-center text-sm opacity-80">
                  <button
                    type="button"
                    className="text-[var(--color-primary)] underline"
                    onClick={() => {
                      setMode("login");
                      setResetStep("request");
                    }}
                  >
                    {t("login")}
                  </button>
                </div>
              </form>
            )}
          </div>

          {mode !== "forgot" && (
            <p className="text-center text-sm mt-6 opacity-80">
              {mode === "login" ? (
                <>
                  {t("noAccount")}{" "}
                  <span
                    className="text-[var(--color-primary)] underline cursor-pointer"
                    onClick={() => setMode("signup")}
                  >
                    {t("signup")}
                  </span>
                </>
              ) : (
                <>
                  {t("haveAccount")}{" "}
                  <span
                    className="text-[var(--color-primary)] underline cursor-pointer"
                    onClick={() => setMode("login")}
                  >
                    {t("login")}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <style>{`
        .animate-fadeSlide {
          animation: fadeSlide .35s ease;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
}

function InputField({
  id,
  name,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  rtl = false,
  showToggle = false,
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const isPasswordField = type === "password";
  const toggleLabel = visible ? t("hidePassword") : t("showPassword");
  const effectiveType =
    showToggle && isPasswordField ? (visible ? "text" : "password") : type;
  const offsetClass = rtl ? "pl-[71px] pr-4" : "pr-[71px] pl-4";
  return (
    <div className="relative">
      {label && id && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] flex items-center gap-1 ${
          rtl ? "left-3" : "right-3"
        } px-2`}
      >
        <Icon className="h-4 w-4 opacity-70" />
        {showToggle && isPasswordField && (
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className={`flex items-center justify-center rounded-full p-1 text-[var(--category-accent)] transition-opacity ${
              visible ? "opacity-100" : "opacity-80"
            }`}
            title={toggleLabel}
            aria-label={toggleLabel}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">{toggleLabel}</span>
          </button>
        )}
      </div>
      <input
        id={id}
        name={name}
        type={effectiveType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input w-full py-3 disabled:opacity-60 ${offsetClass}`}
      />
    </div>
  );
}

function Button({ label, loading, onClick, type = "button" }) {
  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      className={`btn-primary w-full shadow-md transition ${
        loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-95"
      }`}
      style={{ background: "var(--category-accent)" }}
    >
      {loading ? "..." : label}
    </button>
  );
}
