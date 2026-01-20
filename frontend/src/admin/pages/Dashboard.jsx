import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Image,
  List,
  Megaphone,
  PlusCircle,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import {
  getAdminListings,
  getAdminUsers,
  getAuditClicks,
  getMyListings,
  getOrders,
} from "../../api/dataService";

function extractArray(value) {
  return Array.isArray(value) ? value : [];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const role = user?.role || "user";
  const isAdmin = role === "ADMIN" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";

  const [stats, setStats] = useState({
    myListings: 0,
    orders: 0,
    allListings: 0,
    users: 0,
    activity: 0,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const requests = [getMyListings(), getOrders()];
        if (isAdmin) {
          requests.push(getAdminListings({ page: 1, limit: 1 }));
        }
        if (isSuperAdmin) {
          requests.push(getAdminUsers({ page: 1, limit: 1 }));
          requests.push(getAuditClicks({ page: 1, limit: 5 }));
        }

        const results = await Promise.all(requests);
        let cursor = 0;
        const myListingsRes = results[cursor++];
        const ordersRes = results[cursor++];
        const myListings = extractArray(myListingsRes?.data).length
          ? myListingsRes?.data
          : extractArray(myListingsRes?.data?.listings || myListingsRes?.data);
        const orders = extractArray(ordersRes?.data).length
          ? ordersRes?.data
          : extractArray(
              ordersRes?.data?.orders ||
                ordersRes?.data?.items ||
                ordersRes?.data
            );

        let allListingsCount = 0;
        if (isAdmin) {
          const adminListingsRes = results[cursor++];
          allListingsCount =
            Number(adminListingsRes?.data?.total) ||
            extractArray(adminListingsRes?.data?.listings || []).length;
        }

        let usersCount = 0;
        let activityCount = 0;
        if (isSuperAdmin) {
          const usersRes = results[cursor++];
          usersCount =
            Number(usersRes?.data?.total) ||
            extractArray(usersRes?.data?.users || []).length;

          const activityRes = results[cursor++];
          activityCount =
            Number(activityRes?.data?.total) ||
            extractArray(activityRes?.data?.clicks || []).length;
        }

        if (!active) return;
        setStats({
          myListings: myListings.length,
          orders: orders.length,
          allListings: allListingsCount,
          users: usersCount,
          activity: activityCount,
          loading: false,
        });
      } catch {
        if (!active) return;
        setStats((prev) => ({ ...prev, loading: false }));
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin, isSuperAdmin]);

  const cardClass = "detail-card flex flex-col min-h-[260px]";
  const headerClass =
    "flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] font-semibold";
  const headerButtonClass = "btn-primary text-sm";
  const footerButtonClass = "btn-primary w-full";

  const quickActions = useMemo(() => {
    const actions = [
      {
        label: t("createListing"),
        icon: PlusCircle,
        to: "/create-listing",
      },
      {
        label: t("adminNavMyListings"),
        icon: List,
        to: "/admin/my-listings",
      },
    ];

    // Super admin only actions
    if (isSuperAdmin) {
      actions.push(
        {
          label: t("adminNavAllListings"),
          icon: List,
          to: "/admin/listings",
        },
        {
          label: t("adminNavMovingHeader"),
          icon: SlidersHorizontal,
          to: "/admin/moving-header",
        }
      );
    }

    if (isSuperAdmin) {
      actions.push(
        {
          label: t("adminNavUsers"),
          icon: Users,
          to: "/admin/users",
        },
        {
          label: t("adminNavActivity"),
          icon: Activity,
          to: "/admin/activity",
        },
        {
          label: t("adminNavHeroSlides"),
          icon: Image,
          to: "/admin/hero-slides",
        }
      );
    }

    actions.push({
      label: t("adminNavSettings"),
      icon: Settings,
      to: "/admin/settings",
    });

    return actions;
  }, [isAdmin, isSuperAdmin, t]);

  return (
    <div className="space-y-10 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="responsive-title text-slate-900 dark:text-white">
          {t("adminDashboard") || "Tableau de Bord"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t("adminDashboardSubtitle") || "Bienvenue dans votre espace de gestion."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* My Listings Card */}
        <div className="surface-card p-0 overflow-hidden group">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">{t("adminStatsMyListings")}</span>
            <div className="p-2 bg-[var(--category-accent)]/10 rounded-lg text-[var(--category-accent)]">
              <Megaphone size={20} />
            </div>
          </div>

          <div className="p-8 flex flex-col items-center justify-center">
            <div className="text-5xl font-black text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform duration-300">
              {stats.loading ? "..." : stats.myListings}
            </div>
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              {t("adminListingsCount")}
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => navigate("/admin/my-listings")}
              className="btn-primary w-full text-sm py-3"
            >
              {t("adminNavMyListings")}
            </button>
          </div>
        </div>

        {/* My Orders Card */}
        <div className="surface-card p-0 overflow-hidden group">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">{t("adminStatsMyOrders")}</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <ShoppingCart size={20} />
            </div>
          </div>

          <div className="p-8 flex flex-col items-center justify-center">
            <div className="text-5xl font-black text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform duration-300">
              {stats.loading ? "..." : stats.orders}
            </div>
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              {t("adminStatsMyOrders")}
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="btn-primary w-full text-sm py-3 bg-blue-600 hover:bg-blue-700"
            >
              {t("myOrders")}
            </button>
          </div>
        </div>

        {/* All Listings Card (Admin Only) */}
        {isAdmin ? (
          <div className={cardClass}>
            <div className={headerClass}>
              <span>{t("adminStatsAllListings")}</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500">
                <List className="w-10 h-10" />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)] mb-1">
                {stats.loading ? "..." : stats.allListings}
              </div>
              <div className="text-xs uppercase tracking-wider font-bold opacity-40">
                Total {t("adminListingsCount")}
              </div>
            </div>

            <div className="mt-auto p-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => navigate("/admin/listings")}
                className={footerButtonClass}
              >
                {t("adminNavAllListings")}
              </button>
            </div>
          </div>
        ) : null}

        {/* Users Card (Super Admin Only) */}
        {isSuperAdmin ? (
          <div className={cardClass}>
            <div className={headerClass}>
              <span>{t("adminUsers")}</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                <Users className="w-10 h-10" />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)] mb-1">
                {stats.loading ? "..." : stats.users}
              </div>
              <div className="text-xs uppercase tracking-wider font-bold opacity-40">
                {t("adminUsersCount")}
              </div>
            </div>

            <div className="mt-auto p-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className={footerButtonClass}
              >
                {t("adminNavUsers")}
              </button>
            </div>
          </div>
        ) : null}

        {/* Activity Card (Super Admin Only) */}
        {isSuperAdmin ? (
          <div className={cardClass}>
            <div className={headerClass}>
              <span>{t("adminActivity")}</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">
                <Activity className="w-10 h-10" />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)] mb-1">
                {stats.loading ? "..." : stats.activity}
              </div>
              <div className="text-xs uppercase tracking-wider font-bold opacity-40">
                {t("adminEventsCount")}
              </div>
            </div>

            <div className="mt-auto p-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => navigate("/admin/activity")}
                className={footerButtonClass}
              >
                {t("adminNavActivity")}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="detail-card">
        <div className="px-4 py-3 border-b border-[var(--color-border)] mb-4">
          <h2 className="responsive-subtitle m-0">{t("adminQuickActions")}</h2>
          <p className="text-xs opacity-50 mt-0.5">
            {t("adminQuickActionsHint")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.to)}
                className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-4 text-center hover:bg-[var(--category-accent)]/10 hover:border-[var(--category-accent)]/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-border)] group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-[var(--category-accent)]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-tight opacity-80 group-hover:opacity-100">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
