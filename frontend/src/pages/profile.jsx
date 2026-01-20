import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, ShoppingCart } from "lucide-react";

import { getMyListings, getOrders } from "../api/dataService";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listingCount, setListingCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    const role = user?.role || "";
    if (role === "ADMIN" || role === "super_admin") {
      navigate("/admin", { replace: true });
    }
  }, [navigate, user?.role]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [listingsRes, ordersRes] = await Promise.all([
          getMyListings(),
          getOrders(),
        ]);
        const listings = Array.isArray(listingsRes?.data)
          ? listingsRes.data
          : listingsRes?.data?.listings || [];
        const orders = Array.isArray(ordersRes?.data)
          ? ordersRes.data
          : ordersRes?.data?.orders || [];

        if (!active) return;
        setListingCount(listings.length);
        setOrdersCount(orders.length);
      } catch {
        if (!active) return;
        setListingCount(0);
        setOrdersCount(0);
      } finally {
        if (active) setLoadingCounts(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const pageClass =
    "min-h-screen bg-[var(--color-surface-muted)] text-[var(--color-text)]";
  const cardClass =
    "bg-[var(--color-surface)] border-[var(--color-border)] shadow-[var(--shadow-card)]";

  const listingsLabel = loadingCounts ? "..." : String(listingCount);
  const ordersLabel = loadingCounts ? "..." : String(ordersCount);
  const hasListings = !loadingCounts && listingCount > 0;
  const hasOrders = !loadingCounts && ordersCount > 0;

  return (
    <div className={pageClass}>
      <div className="responsive-container py-8">
        <div className="responsive-title mb-5 text-[var(--color-text-strong)]">
          Mon espace membre
        </div>

        <div className="responsive-grid-2">
          <div className={`detail-card flex flex-col min-h-[260px]`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] font-semibold">
              <span>Annonces ({listingsLabel})</span>
              <button
                type="button"
                onClick={() => navigate("/create-listing")}
                className="btn-primary text-sm"
              >
                Ajouter +
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10 text-[var(--color-brand)]">
              <Megaphone className="w-14 h-14 mb-3" />
              <div className="text-sm text-[var(--color-text-muted)]">
                {hasListings ? `${listingCount} annonces` : "Aucune annonce"}
              </div>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={() => navigate("/admin/my-listings")}
                className="btn-primary w-full"
              >
                Liste des annonces
              </button>
            </div>
          </div>

          <div className={`detail-card flex flex-col min-h-[260px]`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] font-semibold">
              <span>Commandes ({ordersLabel})</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10 text-[var(--color-brand)]">
              <ShoppingCart className="w-14 h-14 mb-3" />
              <div className="text-sm text-[var(--color-text-muted)]">
                {hasOrders ? `${ordersCount} commandes` : "Aucune commande"}
              </div>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="btn-primary w-full"
              >
                Liste des commandes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
