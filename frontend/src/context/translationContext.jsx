/* eslint-disable react-refresh/only-export-components */
// src/context/translationContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../translations/translations";

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem("language");
    return stored === "ar" || stored === "fr" ? stored : "fr";
  });

  const rtl = language === "ar";

  useEffect(() => {
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    localStorage.setItem("language", language);
  }, [language, rtl]);

  const setLanguage = (next) => {
    const safe = next === "ar" ? "ar" : "fr";
    setLanguageState(safe);
  };

  const t = (key) => {
    const group = translations[language];
    if (!group) return key;

    return group[key] || key;
  };

  // 🔥 NEW: Translate wilaya name based on language
  const translateWilaya = (wilayaName) => {
    if (
      translations[language] &&
      translations[language].wilayas &&
      translations[language].wilayas[wilayaName]
    ) {
      return translations[language].wilayas[wilayaName];
    }
    return wilayaName;
  };

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        rtl,
        t,
        translateWilaya,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
