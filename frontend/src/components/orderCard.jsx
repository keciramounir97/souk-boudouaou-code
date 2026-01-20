import React from "react";
import { MapPin, ShieldCheck, Calendar, Phone } from "lucide-react";
import { useTranslation } from "../context/translationContext";

const CALL_CENTER = "+213791948070";

export default function OrderCard({ order }) {
  const { t, language } = useTranslation();

  const prepDate = order.preparationDate
    ? new Date(order.preparationDate).toLocaleDateString(language)
    : "-";

  return (
    <div className="surface-card rounded-lg border border-[var(--color-border)] shadow-sm p-4 flex gap-4">
      <div className="h-24 w-28 flex-shrink-0 rounded-md overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
        <img
          src={order.photo || "/placeholder.jpg"}
          alt={order.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{order.title}</h2>
            <p className="text-sm opacity-70 truncate">{order.details || t("details")}</p>
          </div>
          <span className="px-2 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-semibold">
            {order.vaccinated ? t("vaccinated") || "Vacciné" : t("notVaccinated") || "Non vacciné"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <MapPin className="w-4 h-4 text-[var(--category-accent)]" />
            {order.wilaya || t("wilaya")}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <Calendar className="w-4 h-4 text-[var(--category-accent)]" />
            {prepDate}
          </span>
          {order.pricePerKg ? (
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {order.pricePerKg} DA / kg
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs opacity-70">
            {order.details || t("details")} · {order.wilaya || t("wilaya")}
          </div>
          <a
            className="btn-primary inline-flex items-center gap-2"
            href={`tel:${CALL_CENTER}`}
          >
            <Phone className="w-4 h-4" />
            {t("callNow") || "Appeler"}
          </a>
        </div>
      </div>
    </div>
  );
}
