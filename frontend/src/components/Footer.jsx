import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react";
import { useTranslation } from "../context/translationContext";
import { useTheme } from "../context/themeContext";
import Logo from "./Logo";

const DEFAULT_CALL_CENTERS = [
  "+213 791 948 070",
  "+213 791 948 071",
  "+213 791 948 072",
];

export default function Footer() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { darkMode } = useTheme();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: MessageCircle, href: "#", label: "Message" },
    { icon: Mail, href: "mailto:contact@soukboudouaou.dz", label: "Email" },
  ];


  return (
    <footer className={`relative border-t ${
      darkMode 
        ? "bg-[#0f0f0f] text-white border-white/10" 
        : "bg-white text-slate-900 border-slate-200"
    }`}>
      <div className="responsive-container py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo
                alt="Souk Boudouaou"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain"
              />
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">Souk Boudouaou</h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {language === "ar" ? "سوق إلكتروني" : "Marché en ligne"}
                </p>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              {language === "ar"
                ? "منصة رائدة للتجارة الإلكترونية في الجزائر. نوفر أفضل المنتجات والخدمات مع ضمان الجودة والأمان."
                : "Plateforme de commerce en ligne leader en Algérie. Nous offrons les meilleurs produits et services avec garantie de qualité et sécurité."}
            </p>

            <div className="flex items-center gap-4">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target={social.href.startsWith("mailto:") ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-all ${
                      darkMode
                        ? "hover:bg-white/10 text-slate-400 hover:text-[var(--category-accent)]"
                        : "hover:bg-slate-100 text-slate-600 hover:text-[var(--category-accent)]"
                    }`}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className={`text-base font-bold flex items-center gap-2 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              <Phone className="w-4 h-4" style={{ color: "var(--category-accent)" }} />
              {t("callCenterTitle") || (language === "ar" ? "مركز الاتصال" : "Centre d'appel")}
            </h4>
            <div className="space-y-2">
              {DEFAULT_CALL_CENTERS.map((num, idx) => (
                <a
                  key={idx}
                  href={`tel:${num.replace(/\s+/g, "")}`}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    darkMode 
                      ? "text-slate-400 hover:text-white" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>{t("center") || (language === "ar" ? "المركز" : "Centre")} #{idx + 1}: {num}</span>
                </a>
              ))}
            </div>

            <div className={`space-y-2 pt-4 border-t ${
              darkMode ? "border-white/10" : "border-slate-200"
            }`}>
              <div className={`flex items-center gap-2 text-sm transition-colors ${
                darkMode 
                  ? "text-slate-400 hover:text-white" 
                  : "text-slate-600 hover:text-slate-900"
              }`}>
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@soukboudouaou.dz" className="hover:underline">
                  contact@soukboudouaou.dz
                </a>
              </div>
              <div className={`flex items-center gap-2 text-sm ${
                darkMode 
                  ? "text-slate-400" 
                  : "text-slate-600"
              }`}>
                <MapPin className="w-4 h-4" />
                <span>{language === "ar" ? "بودواو، الجزائر" : "Boudouaou, Algérie"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t ${
          darkMode ? "border-white/10" : "border-slate-200"
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className={`text-sm text-center md:text-left ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              © {new Date().getFullYear()} Souk Boudouaou. {t("rights") || (language === "ar" ? "جميع الحقوق محفوظة." : "Tous droits réservés.")}
            </div>
            <div className={`flex items-center gap-6 text-sm ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              <button
                onClick={() => navigate("/privacy")}
                className={`transition-colors ${
                  darkMode ? "hover:text-white" : "hover:text-slate-900"
                }`}
              >
                {t("privacy") || (language === "ar" ? "الخصوصية" : "Confidentialité")}
              </button>
              <button
                onClick={() => navigate("/terms")}
                className={`transition-colors ${
                  darkMode ? "hover:text-white" : "hover:text-slate-900"
                }`}
              >
                {t("terms") || (language === "ar" ? "الشروط" : "Conditions")}
              </button>
              <button
                onClick={() => navigate("/cookies")}
                className={`transition-colors ${
                  darkMode ? "hover:text-white" : "hover:text-slate-900"
                }`}
              >
                {t("cookies") || (language === "ar" ? "ملفات تعريف الارتباط" : "Cookies")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
