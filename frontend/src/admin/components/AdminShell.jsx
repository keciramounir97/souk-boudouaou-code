import React, { useMemo, useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutGrid,
  List,
  Settings,
  Image,
  SlidersHorizontal,
  Users,
  Tags,
  Phone,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import { useTheme } from "../../context/themeContext";

function navItemClass({ isActive }, collapsed = false) {
  return [
    "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
    collapsed ? "px-3 py-2.5 justify-center" : "px-4 py-2.5",
    "outline-none focus-visible:ring-2 focus-visible:ring-[var(--category-accent)]/40",
    isActive
      ? "bg-[var(--category-accent)] text-white shadow-sm"
      : "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
  ].join(" ");
}

function titleKeyForPath(pathname) {
  if (pathname.endsWith("/my-listings")) return "adminTitleMyListings";
  if (pathname.endsWith("/orders")) return "adminTitleMyOrders";
  if (pathname.endsWith("/listings")) return "adminTitleAllListings";
  if (pathname.endsWith("/users")) return "adminTitleUsers";
  if (pathname.endsWith("/activity")) return "adminTitleActivity";
  if (pathname.endsWith("/moving-header")) return "adminTitleMovingHeader";
  if (pathname.endsWith("/hero-slides")) return "adminTitleHeroSlides";
  if (pathname.endsWith("/footer")) return "adminTitleFooter";
  if (pathname.endsWith("/categories")) return "adminTitleCategories";
  if (pathname.endsWith("/settings")) return "adminTitleSettings";
  return "adminTitleDashboard";
}

export default function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const role = user?.role || "user";
  const isAdmin = role === "ADMIN" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";

  // Redirect non-admin users away from admin panel
  useEffect(() => {
    if (!user || (!isAdmin && !isSuperAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, isSuperAdmin, navigate]);

  const displayName = user?.fullName || user?.name || t("user");

  const title = useMemo(() => {
    return t(titleKeyForPath(location.pathname));
  }, [location.pathname, t]);

  const nav = (collapsed = false) => (
    <nav className="space-y-0.5">
      <NavLink
        to="/admin"
        end
        className={({ isActive }) => navItemClass({ isActive }, collapsed)}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? (t("adminNavDashboard") || "Tableau de bord") : ""}
      >
        <LayoutGrid className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span>{t("adminNavDashboard") || "Tableau de bord"}</span>}
      </NavLink>

      <NavLink
        to="/admin/my-listings"
        className={({ isActive }) => navItemClass({ isActive }, collapsed)}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? (t("adminNavMyListings") || "Mes annonces") : ""}
      >
        <List className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span>{t("adminNavMyListings") || "Mes annonces"}</span>}
      </NavLink>

      <NavLink
        to="/admin/my-account"
        className={({ isActive }) => navItemClass({ isActive }, collapsed)}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? (t("myAccount") || "Mon Compte") : ""}
      >
        <Users className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span>{t("myAccount") || "Mon Compte"}</span>}
      </NavLink>

      {/* Settings - available to all users and admins */}
      <NavLink
        to="/admin/settings"
        className={({ isActive }) => navItemClass({ isActive }, collapsed)}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? (t("adminNavSettings") || "Paramètres") : ""}
      >
        <Settings className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span>{t("adminNavSettings") || "Paramètres"}</span>}
      </NavLink>

      {isSuperAdmin ? (
        <>
          {!collapsed && (
            <>
              <div className={`h-px bg-[var(--color-border)] my-3 mx-4`} />
              <div className="px-4 py-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {t("superAdmin") || "Super Admin"}
                </div>
              </div>
            </>
          )}
          <NavLink
            to="/admin/listings"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("adminNavAllListings") || "Toutes les annonces") : ""}
          >
            <List className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("adminNavAllListings") || "Toutes les annonces"}</span>}
          </NavLink>
          <NavLink
            to="/admin/moving-header"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("adminNavMovingHeader") || "En-tête défilant") : ""}
          >
            <SlidersHorizontal className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("adminNavMovingHeader") || "En-tête défilant"}</span>}
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("adminNavCategories") || "Catégories") : ""}
          >
            <Tags className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("adminNavCategories") || "Catégories"}</span>}
          </NavLink>
          <NavLink
            to="/admin/filtration"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("filtration") || "Filtration") : ""}
          >
            <Tags className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("filtration") || "Filtration"}</span>}
          </NavLink>
          <NavLink
            to="/admin/demo"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("demo") || "Demo") : ""}
          >
            <Activity className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("demo") || "Demo"}</span>}
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("adminNavUsers") || "Utilisateurs") : ""}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("adminNavUsers") || "Utilisateurs"}</span>}
          </NavLink>
          <NavLink
            to="/admin/activity"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("adminNavActivity") || "Activité") : ""}
          >
            <Activity className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("adminNavActivity") || "Activité"}</span>}
          </NavLink>
          <NavLink
            to="/admin/hero-slides"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("adminNavHeroSlides") || "Diapositives") : ""}
          >
            <Image className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("adminNavHeroSlides") || "Diapositives"}</span>}
          </NavLink>
          <NavLink
            to="/admin/call-centers"
            className={({ isActive }) => navItemClass({ isActive }, collapsed)}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? (t("callCenters") || "Centres d'appel") : ""}
          >
            <Phone className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t("callCenters") || "Centres d'appel"}</span>}
          </NavLink>
        </>
      ) : null}
    </nav>
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] overflow-hidden">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar - Enhanced Responsive */}
        <aside className={`hidden lg:block ${sidebarCollapsed ? "w-20" : "w-64"} flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 h-screen overflow-y-auto transition-all duration-300 z-30 scrollbar-hide`}>
          {/* Sidebar Header */}
          <div className={`${sidebarCollapsed ? "px-3" : "px-6"} py-5 border-b border-[var(--color-border)] ${darkMode ? "bg-[#0f0f0f]" : "bg-white"} transition-all duration-300`}>
            <div className="flex items-center justify-between mb-1">
              {!sidebarCollapsed && (
                <div className="font-bold text-xl tracking-tight text-[var(--color-text)]">
                  Dashboard
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
                title={sidebarCollapsed ? "Expand" : "Collapse"}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
              </button>
            </div>
            {!sidebarCollapsed && (
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                {user?.role || "User"}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`${sidebarCollapsed ? "px-2" : "px-3"} py-4 transition-all duration-300`}>
            {nav(sidebarCollapsed)}
          </div>

          {/* User Profile Card */}
          <div className={`${sidebarCollapsed ? "px-2" : "px-4"} py-4 mt-auto border-t border-[var(--color-border)] ${darkMode ? "bg-[#0f0f0f]" : "bg-slate-50"} transition-all duration-300`}>
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
              <div className="w-10 h-10 rounded-full bg-[var(--category-accent)] flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {displayName.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate text-[var(--color-text)]">
                      {displayName}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">
                      {user?.email || user?.username}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title={t("logout") || "Déconnexion"}
                  >
                    <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-40 shadow-sm">
            <div className="font-bold text-lg text-[var(--color-text)]">
              {title || "Dashboard"}
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              <Menu size={20} className="text-[var(--category-accent)]" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--color-surface)] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 ${darkMode ? "border-r border-white/10" : "border-r border-slate-200"}`}>
            {/* Mobile Sidebar Header */}
            <div className={`px-6 py-5 border-b border-[var(--color-border)] ${darkMode ? "bg-[#0f0f0f]" : "bg-white"}`}>
              <div className="flex items-center justify-between">
                <div className="font-bold text-lg text-[var(--color-text)]">
                  Navigation
                </div>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg
                    className="w-5 h-5 text-[var(--color-text)]"
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
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {nav(false)}
            </div>

            {/* Mobile User Profile */}
            <div className={`px-4 py-4 border-t border-[var(--color-border)] ${darkMode ? "bg-[#0f0f0f]" : "bg-slate-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--category-accent)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {displayName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate text-[var(--color-text)]">
                      {displayName}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">
                      {user?.email || user?.username}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                  title={t("logout") || "Déconnexion"}
                >
                  <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
