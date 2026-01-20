import React, { useState } from "react";
import { useTranslation } from "../../context/translationContext";
import { useAuth } from "../../context/AuthContext";
import {
  isMockListingsEnabled,
  isMockUsersEnabled,
  setMockListingsEnabled,
  setMockUsersEnabled,
  clearMockCaches,
} from "../../api/dataService";

export default function DemoSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [mockListings, setMockListings] = useState(isMockListingsEnabled());
  const [mockUsers, setMockUsers] = useState(isMockUsersEnabled());

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">{t("accessDenied") || "Accès refusé"}</h1>
          <p className="text-[var(--color-text-muted)]">{t("adminSuperAdminOnly") || "Cette page est réservée aux super administrateurs"}</p>
        </div>
      </div>
    );
  }

  const handleToggleListings = () => {
    const next = !mockListings;
    setMockListings(next);
    setMockListingsEnabled(next);
    window.location.reload();
  };

  const handleToggleUsers = () => {
    const next = !mockUsers;
    setMockUsers(next);
    setMockUsersEnabled(next);
    window.location.reload();
  };

  return (
    <div>
      <h1 className="responsive-title mb-2">
        {t("mockModeTitle") || "Mode Demo"}
      </h1>
      <p className="opacity-70 mb-6">
        {t("mockModeHint") || "Gérez les données de démonstration."}
      </p>

      <div className="detail-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {t("mockListings") || "Mock Annonces"}
            </div>
            <div className="text-sm opacity-70">
              {t("mockListingsHint") || "Utiliser des fausses annonces."}
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mockListings
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={handleToggleListings}
          >
            {mockListings
              ? t("mockDisable") || "Désactiver"
              : t("mockEnable") || "Activer"}
          </button>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {t("mockUsers") || "Mock Utilisateurs"}
            </div>
            <div className="text-sm opacity-70">
              {t("mockUsersHint") ||
                "Utiliser des fausses données utilisateurs."}
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mockUsers
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={handleToggleUsers}
          >
            {mockUsers
              ? t("mockDisable") || "Désactiver"
              : t("mockEnable") || "Activer"}
          </button>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        <div>
          <button
            className="btn-secondary text-red-500"
            onClick={() => {
              clearMockCaches();
              alert(t("mockCacheCleared") || "Cache vidé.");
            }}
          >
            {t("mockClearCache") || "Vider le cache Mock"}
          </button>
        </div>
      </div>
    </div>
  );
}
