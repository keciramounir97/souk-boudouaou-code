/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Menu, Globe, User, Sun, Moon, ChevronDown, Search, Bell, ShoppingCart } from "lucide-react";
import { CirclePlus, Tag as TagIcon } from "akar-icons";

import { useTheme } from "../context/themeContext";
import { useTranslation } from "../context/translationContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import MovingHeader from "./movingHeader";
import Logo from "./Logo";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const { darkMode, toggleDarkMode } = useTheme();
  const { t, language, setLanguage, rtl } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setUserMenuOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  // Switch languages (FR <-> AR only)
  const cycleLanguage = () => {
    if (language === "fr") setLanguage("ar");
    else setLanguage("fr");
  };

  const displayName = user?.fullName || user?.name || t("user");

  return (
    <>
      {/* MAIN HEADER - Ouedkniss-inspired */}
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? darkMode
              ? "bg-[#0f0f0f] text-white border-b border-white/10 shadow-lg"
              : "bg-white text-slate-900 border-b border-slate-200 shadow-md"
            : darkMode
            ? "bg-[#0f0f0f]/95 text-white border-b border-white/10"
            : "bg-white/95 text-slate-900 border-b border-slate-200"
        } backdrop-blur-md`}
      >
        <div className="responsive-container">
          {/* TOP BAR */}
          <div className="flex items-center justify-between h-16 gap-3">
            {/* LEFT SECTION - Logo & Menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                className="p-2 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} className="text-[var(--category-accent)]" />
              </button>

              <div
                className="cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => navigate("/")}
              >
                <Logo
                  alt="Logo"
                  className="h-14 sm:h-16 md:h-20 w-auto object-contain"
                />
              </div>
            </div>

            {/* CENTER SECTION - Search Bar (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="w-full flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[var(--category-accent)] transition-all">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder") || "Rechercher..."}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  onClick={() => navigate("/")}
                />
              </div>
            </div>

            {/* RIGHT SECTION - Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Mobile Search Icon */}
              <button
                onClick={() => navigate("/")}
                className="md:hidden p-2 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-lg transition-all"
                aria-label="Search"
              >
                <Search size={20} className="text-[var(--category-accent)]" />
              </button>

              {/* Language Toggle */}
              <button
                onClick={cycleLanguage}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all text-sm font-medium"
                title={t("language")}
              >
                <Globe size={16} className="text-[var(--category-accent)]" />
                <span className="uppercase text-xs font-semibold">{language}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="hidden sm:flex p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all"
                title={darkMode ? t("lightMode") : t("darkMode")}
              >
                {darkMode ? (
                  <Sun size={18} className="text-amber-400" />
                ) : (
                  <Moon size={18} className="text-slate-600" />
                )}
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

              {/* Create Listing Button */}
              <button
                onClick={() => {
                  if (user) navigate("/create-listing");
                  else navigate("/auth");
                }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--category-accent)" }}
              >
                <CirclePlus strokeWidth={2.5} size={18} />
                <span>{t("createListing") || "Publier"}</span>
              </button>

              {/* Mobile Create Icon */}
              <button
                onClick={() => {
                  if (user) navigate("/create-listing");
                  else navigate("/auth");
                }}
                className="sm:hidden p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all"
                title={t("createListing") || "Créer une annonce"}
              >
                <CirclePlus
                  strokeWidth={2}
                  size={20}
                  className="text-[var(--category-accent)]"
                />
              </button>

              {/* Saved Listings */}
              <button
                onClick={() => navigate("/saved")}
                className="p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all relative"
                title={t("savedListingsTitle") || "Favoris"}
              >
                <TagIcon
                  strokeWidth={2}
                  size={20}
                  className="text-[var(--category-accent)]"
                />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-2 sm:py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[var(--category-accent)] transition-all bg-slate-50 dark:bg-white/5"
                  onClick={() =>
                    user ? setUserMenuOpen(!userMenuOpen) : navigate("/auth")
                  }
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--category-accent)] flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user ? displayName.charAt(0) : "?"}
                  </div>
                  {user && (
                    <>
                      <span className="hidden lg:inline font-semibold text-sm">
                        {displayName}
                      </span>
                      <ChevronDown
                        size={14}
                        className="hidden sm:block text-slate-400"
                      />
                    </>
                  )}
                </button>

                {user && userMenuOpen && (
                  <div
                    className={`
                      absolute right-0 mt-2 w-64 rounded-xl shadow-2xl
                      ${
                        darkMode
                          ? "bg-[#1a1a1a] text-white border-white/10"
                          : "bg-white text-slate-900 border-slate-100"
                      }
                      border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200
                    `}
                  >
                    <div
                      className={`px-4 py-3 border-b ${
                        darkMode ? "border-gray-700" : "border-gray-100"
                      }`}
                    >
                      <div className="font-semibold truncate text-sm">
                        {displayName}
                      </div>
                      <div className="text-xs opacity-60 truncate mt-0.5">
                        {user.email || user.username}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate("/admin/my-account");
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm"
                      >
                        <User size={16} className="opacity-70" />
                        {t("myAccount") || "Mon compte"}
                      </button>

                      {(user.role === "user" ||
                        user.role === "ADMIN" ||
                        user.role === "super_admin") && (
                        <button
                          onClick={() => {
                            navigate("/admin");
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm"
                        >
                          <Menu size={16} className="opacity-70" />
                          {t("adminDashboard")}
                        </button>
                      )}
                    </div>

                    <div
                      className={`border-t ${
                        darkMode ? "border-gray-700" : "border-gray-100"
                      } py-1`}
                    >
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigate("/");
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 text-sm"
                      >
                        <svg
                          className="w-4 h-4 opacity-70"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOVING HEADER */}
      <MovingHeader sidebarOpen={sidebarOpen} />

      {/* SIDEBAR */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
    </>
  );
}
