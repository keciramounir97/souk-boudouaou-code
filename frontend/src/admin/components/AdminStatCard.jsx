import React from "react";

export default function AdminStatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
            {label}
          </div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
          {hint ? <div className="text-sm opacity-70 mt-1">{hint}</div> : null}
        </div>
        {Icon ? (
          <div className="h-10 w-10 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

