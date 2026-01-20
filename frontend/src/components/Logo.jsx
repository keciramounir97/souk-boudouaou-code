import React, { useEffect, useState } from "react";
import { useTheme } from "../context/themeContext";
import { getLogoSettings } from "../api/dataService";
import { normalizeImageUrl } from "../utils/images";
import logoLight from "../assets/logo-white.png";
import logoDark from "../assets/logo-dark.png";

export default function Logo({ className = "", alt = "Logo", forceDark = false, ...props }) {
  const { darkMode } = useTheme();
  const [logoConfig, setLogoConfig] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const json = await getLogoSettings();
        const logo = json?.data?.logo || json?.logo || { logoLight: "", logoDark: "" };
        if (active) setLogoConfig(logo);
      } catch {
        if (active) setLogoConfig({ logoLight: "", logoDark: "" });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Use forceDark prop to always use dark logo, otherwise use theme
  const effectiveDarkMode = forceDark ? true : darkMode;

  // Use API logo if available, fallback to assets
  const logoUrl = effectiveDarkMode
    ? (logoConfig?.logoDark ? normalizeImageUrl(logoConfig.logoDark) : logoDark)
    : (logoConfig?.logoLight ? normalizeImageUrl(logoConfig.logoLight) : logoLight);

  const fallbackLogo = effectiveDarkMode ? logoDark : logoLight;

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        // Fallback to asset logo if API logo fails
        if (e.currentTarget.src !== fallbackLogo) {
          e.currentTarget.src = fallbackLogo;
        }
      }}
      {...props}
    />
  );
}
