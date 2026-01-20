import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import { useNavigate } from "react-router-dom";
import {
  getAdminMovingHeaderSettings,
  updateMovingHeaderSettings,
  DEFAULT_MOVING_HEADER_FONT_CONFIG,
} from "../../api/dataService";
import { useToast } from "../../context/ToastContext";

const PRODUCT_OPTIONS = [
  { value: "Poulet", label: "Poulet" },
  { value: "Poussins", label: "Poussins" },
  { value: "Dinde", label: "Dinde" },
  { value: "Oeufs", label: "Oeufs" },
];

const UNIT_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "piece", label: "pièce" },
  { value: "douzaine", label: "douzaine" },
];

const FONT_OPTIONS = [
  "Inter",
  "Space Grotesk",
  "Manrope",
  "Poppins",
  "Montserrat",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Ubuntu",
  "Lato",
  "Raleway",
  "Source Sans Pro",
  "Mukta",
  "Cairo",
  "Tajawal",
  "Amiri",
  "Noto Naskh Arabic",
  "Noto Kufi Arabic",
  "IBM Plex Sans Arabic",
  "Readex Pro",
  "Markazi Text",
  "Lateef",
  "Harmattan",
  "Reem Kufi",
  "Reem Kufi Fun",
  "Aref Ruqaa",
  "Aref Ruqaa Ink",
  "Mada",
  "Kufam",
  "Qahiri",
  "Mirza",
  "Rakkas",
  "Lemonada",
  "Katibeh",
  "Noto Sans",
  "Noto Serif",
  "Almarai",
  "Scheherazade New",
  "Changa",
  "El Messiri",
  "Vazirmatn",
  "Tinos",
  "Kanit",
  "Baloo 2",
  "Heebo",
  "Assistant",
  "Exo 2",
  "Figtree",
  "Open Sans",
  "Oswald",
  "Quicksand",
  "Sora",
  "Mukta Mahee",
  "Rubik",
  "Work Sans",
  "Barlow",
  "Bebas Neue",
  "Courier New",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Verdana",
  "Trebuchet MS",
  "Tahoma",
  "Bookman",
  "Lora",
  "Avenir",
  "Gill Sans",
  "Josefin Sans",
].map((font) => ({ value: font, label: font }));

const FONT_WEIGHT_OPTIONS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

const FONT_STYLE_OPTIONS = ["normal", "italic", "oblique"];

export default function MovingHeaderSettings() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const isSuperAdmin = user?.role === "super_admin";
  const canEdit = isSuperAdmin;

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [prefixFr, setPrefixFr] = useState("");
  const [prefixAr, setPrefixAr] = useState("");
  const [textColor, setTextColor] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [animationDuration, setAnimationDuration] = useState(25);
  const [heightPx, setHeightPx] = useState(60);
  const [translateWilayaAr, setTranslateWilayaAr] = useState(true);
  const [fontConfig, setFontConfig] = useState(() => ({
    ...DEFAULT_MOVING_HEADER_FONT_CONFIG,
  }));

  useEffect(() => {
    if (!canEdit) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const json = await getAdminMovingHeaderSettings();
        const list = json.data?.items || [];
        const nextFontConfig =
          json.data?.fontConfig || DEFAULT_MOVING_HEADER_FONT_CONFIG;
        if (active) {
          setItems(list);
          setFontConfig(nextFontConfig);
          setPrefixFr(String(json.data?.prefixFr || ""));
          setPrefixAr(String(json.data?.prefixAr || ""));
          setTextColor(String(json.data?.textColor || ""));
          setBackgroundColor(String(json.data?.backgroundColor || ""));
          setAnimationDuration(Number(json.data?.animationDuration || 25));
          setHeightPx(Number(json.data?.heightPx || 60));
          setTranslateWilayaAr(Boolean(json.data?.translateWilayaAr ?? true));
        }
        try {
          localStorage.setItem(
            "moving_header",
            JSON.stringify({
              items: list,
              fontConfig: nextFontConfig,
              prefixFr: String(json.data?.prefixFr || ""),
              prefixAr: String(json.data?.prefixAr || ""),
              textColor: String(json.data?.textColor || ""),
              heightPx: Number(json.data?.heightPx || 60),
              translateWilayaAr: Boolean(json.data?.translateWilayaAr ?? true),
              ts: Date.now(),
            })
          );
        } catch {
          // ignore storage errors
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [canEdit]);

  const preview = useMemo(() => {
    const byProduct = new Map();
    items.forEach((i) => {
      const key = i.product || "Poulet";
      const arr = byProduct.get(key) || [];
      arr.push(i);
      byProduct.set(key, arr);
    });
    const parts = [];
    for (const [product, arr] of byProduct.entries()) {
      const segment = arr
        .map(
          (x) =>
            `${x.wilaya}: ${x.price}${t("currency") || "DA"}/${t("kg") || "kg"}`
        )
        .join(" · ");
      parts.push(`${product}: ${segment}`);
    }
    return parts.join(" | ");
  }, [items]);

  const fontPreviewStyle = useMemo(
    () => ({
      fontFamily: fontConfig.fontFamily,
      fontSize: `${fontConfig.fontSize}px`,
      fontWeight: fontConfig.fontWeight,
      fontStyle: fontConfig.fontStyle,
      letterSpacing: `${fontConfig.letterSpacing}em`,
      wordSpacing: `${fontConfig.wordSpacing}em`,
    }),
    [fontConfig]
  );

  if (!canEdit) {
    return (
      <div>
        <div className="detail-card">
          <h1 className="responsive-title">{t("accessDenied")}</h1>
          <p className="mt-2 opacity-80">{t("adminAdminsOnly")}</p>
          <button
            className="btn-primary mt-4"
            onClick={() => navigate("/admin")}
          >
            {t("back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="responsive-title">
          {t("movingHeaderSettingsTitle")} – {t("movingHeaderSettingsSubtitle")}
        </h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => navigate("/admin")}>
            {t("adminNavDashboard")}
          </button>
          <button
            className="btn-primary"
            disabled={saving || loading}
            onClick={async () => {
              setSaving(true);
              try {
                const payload = {
                  items,
                  fontConfig,
                  prefixFr,
                  prefixAr,
                  textColor,
                  backgroundColor,
                  animationDuration,
                  heightPx,
                  translateWilayaAr,
                };
                const json = await updateMovingHeaderSettings(payload);
                if (!json.success)
                  throw new Error(json.message || "Save failed");
                const next = json.data?.items || items;
                const nextFontConfig =
                  json.data?.fontConfig ||
                  fontConfig ||
                  DEFAULT_MOVING_HEADER_FONT_CONFIG;
                const nextPrefixFr = String(
                  json.data?.prefixFr || prefixFr || ""
                );
                const nextPrefixAr = String(
                  json.data?.prefixAr || prefixAr || ""
                );
                const nextTextColor = String(
                  json.data?.textColor || textColor || ""
                );
                const nextHeightPx = Number(
                  json.data?.heightPx || heightPx || 60
                );
                const nextTranslateWilayaAr = Boolean(
                  json.data?.translateWilayaAr ?? translateWilayaAr
                );
                toast.success(
                  t("savedSuccessfully") || "Sauvegardé avec succès"
                );
                try {
                  localStorage.setItem(
                    "moving_header",
                    JSON.stringify({
                      items: next,
                      fontConfig: nextFontConfig,
                      prefixFr: nextPrefixFr,
                      prefixAr: nextPrefixAr,
                      textColor: nextTextColor,
                      heightPx: nextHeightPx,
                      translateWilayaAr: nextTranslateWilayaAr,
                      ts: Date.now(),
                    })
                  );
                } catch {}
                try {
                  window.dispatchEvent(
                    new CustomEvent("moving-header-updated", {
                      detail: {
                        items: next,
                        fontConfig: nextFontConfig,
                        prefixFr: nextPrefixFr,
                        prefixAr: nextPrefixAr,
                        textColor: nextTextColor,
                        heightPx: nextHeightPx,
                        translateWilayaAr: nextTranslateWilayaAr,
                      },
                    })
                  );
                } catch {}
              } catch (e) {
                toast.error(e?.message || "Save failed");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>

      <div className="detail-card">
        {loading ? (
          <div className="opacity-70">{t("loading")}</div>
        ) : (
          <div className="space-y-8">
            <div className="bg-[var(--color-surface-muted)] p-4 rounded-lg">
              <div className="text-sm font-semibold mb-2 opacity-80">
                {t("adminPreview")}
              </div>
              <div className="text-sm">{preview || "—"}</div>
            </div>

            <div className="space-y-4">
              <h2 className="responsive-subtitle">
                {t("movingHeaderDisplaySettingsTitle") || "Affichage"}
              </h2>
              <div className="responsive-grid-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">
                    {t("movingHeaderPrefixFrLabel") ||
                      "Texte avant les prix (FR)"}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={prefixFr}
                    onChange={(e) => setPrefixFr(e.target.value)}
                    placeholder={t("pricesScrolling") || "Prix du jour"}
                  />
                  <div className="text-xs opacity-70">
                    {t("movingHeaderPrefixTip") ||
                      "Ex: Prix du jour, Prix du poulet, Prix du marché..."}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">
                    {t("movingHeaderPrefixArLabel") ||
                      "Texte avant les prix (AR)"}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={prefixAr}
                    onChange={(e) => setPrefixAr(e.target.value)}
                    placeholder="أسعار اليوم"
                  />
                  <div className="text-xs opacity-70">
                    {t("movingHeaderPrefixTipAr") ||
                      "مثال: أسعار اليوم، أسعار الدجاج، أسعار السوق..."}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">
                    {t("movingHeaderTextColorLabel") || "Couleur du texte"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="h-10 w-12 rounded-lg border border-[var(--color-border)] bg-transparent cursor-pointer"
                      value={textColor || "#ffffff"}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input flex-1"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                  <div className="text-xs opacity-70">
                    {t("movingHeaderTextColorTip") ||
                      "Hex conseillé (#ffffff)."}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">
                    {t("movingHeaderBackgroundColorLabel") || "Couleur du fond"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="h-10 w-12 rounded-lg border border-[var(--color-border)] bg-transparent cursor-pointer"
                      value={backgroundColor || "#1a1a1a"}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input flex-1"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#1a1a1a"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">
                    {t("movingHeaderAnimationDurationLabel") ||
                      "Vitesse (secondes)"}
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    min="5"
                    max="120"
                    step="1"
                    value={animationDuration}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!Number.isFinite(v)) return;
                      setAnimationDuration(v);
                    }}
                  />
                  <div className="text-xs opacity-70">
                    Plus le chiffre est grand, plus c'est lent. (Défaut: 25)
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">
                    {t("movingHeaderHeightLabel") || "Hauteur (px)"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="form-input flex-1"
                      min="40"
                      max="120"
                      step="1"
                      value={heightPx}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isFinite(v)) return;
                        setHeightPx(v);
                      }}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setHeightPx(60)}
                    >
                      {t("reset") || "Reset"}
                    </button>
                  </div>
                  <div className="text-xs opacity-70">
                    {t("movingHeaderHeightTip") ||
                      "Hauteur actuelle par défaut: 60px."}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">
                    {t("movingHeaderWilayaTranslateLabel") ||
                      "Traduire les wilayas en arabe"}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={translateWilayaAr}
                      onChange={(e) => setTranslateWilayaAr(e.target.checked)}
                    />
                    <span className="opacity-80">
                      {t("movingHeaderWilayaTranslateTip") ||
                        "Affiche les wilayas en arabe quand la langue est AR."}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
              <h2 className="responsive-subtitle">
                {t("movingHeaderFontSettingsTitle")}
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">
                    {t("movingHeaderFontFamilyLabel")}
                  </label>
                  <select
                    className="form-select w-full"
                    value={fontConfig.fontFamily}
                    onChange={(e) =>
                      setFontConfig((prev) => ({
                        ...prev,
                        fontFamily: e.target.value,
                      }))
                    }
                  >
                    {FONT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs opacity-70">
                    {t("movingHeaderFontFamilyTip")}
                  </div>
                </div>

                <div className="responsive-grid-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">
                      {t("movingHeaderFontSizeLabel")}
                    </label>
                    <input
                      type="number"
                      className="form-input w-full"
                      min="8"
                      value={fontConfig.fontSize}
                      step="1"
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!Number.isFinite(value)) return;
                        setFontConfig((prev) => ({
                          ...prev,
                          fontSize: value,
                        }));
                      }}
                    />
                    <div className="text-xs opacity-70">
                      {t("movingHeaderFontSizeTip")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">
                      {t("movingHeaderFontWeightLabel")}
                    </label>
                    <select
                      className="form-select w-full"
                      value={fontConfig.fontWeight}
                      onChange={(e) =>
                        setFontConfig((prev) => ({
                          ...prev,
                          fontWeight: e.target.value,
                        }))
                      }
                    >
                      {FONT_WEIGHT_OPTIONS.map((weight) => (
                        <option key={weight} value={weight}>
                          {weight}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs opacity-70">
                      {t("movingHeaderFontWeightTip")}
                    </div>
                  </div>
                </div>

                <div className="responsive-grid-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">
                      {t("movingHeaderFontStyleLabel")}
                    </label>
                    <select
                      className="form-select w-full"
                      value={fontConfig.fontStyle}
                      onChange={(e) =>
                        setFontConfig((prev) => ({
                          ...prev,
                          fontStyle: e.target.value,
                        }))
                      }
                    >
                      {FONT_STYLE_OPTIONS.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs opacity-70">
                      {t("movingHeaderFontStyleTip")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">
                      {t("movingHeaderLetterSpacingLabel")}
                    </label>
                    <input
                      type="number"
                      className="form-input w-full"
                      min="0"
                      step="0.05"
                      value={fontConfig.letterSpacing}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!Number.isFinite(value)) return;
                        setFontConfig((prev) => ({
                          ...prev,
                          letterSpacing: value,
                        }));
                      }}
                    />
                    <div className="text-xs opacity-70">
                      {t("movingHeaderLetterSpacingTip")}
                    </div>
                  </div>
                </div>

                <div className="responsive-grid-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">
                      {t("movingHeaderWordSpacingLabel")}
                    </label>
                    <input
                      type="number"
                      className="form-input w-full"
                      min="0"
                      step="0.05"
                      value={fontConfig.wordSpacing}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!Number.isFinite(value)) return;
                        setFontConfig((prev) => ({
                          ...prev,
                          wordSpacing: value,
                        }));
                      }}
                    />
                    <div className="text-xs opacity-70">
                      {t("movingHeaderWordSpacingTip")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface-muted)] rounded-lg p-6 border border-[var(--color-border)] mt-4">
                <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3 text-center">
                  {t("movingHeaderFontPreviewLabel")}
                </div>
                <div
                  className="px-4 py-3 text-center uppercase"
                  style={fontPreviewStyle}
                >
                  {t("movingHeaderFontPreviewText") || "Bandeau Souk Boudouaou"}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)]">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="responsive-subtitle m-0">
                  {t("movingHeaderSettingsItemsTitle") || "Liste des prix"}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm opacity-60">
                    {items.length} {t("adminLinesCount")}
                  </span>
                  <button
                    className="btn-primary py-2 px-4 text-sm"
                    type="button"
                    onClick={() => {
                      setItems((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          product: "Poulet",
                          wilaya: "Alger",
                          price: 0,
                          unit: "kg",
                        },
                      ]);
                    }}
                  >
                    {t("add")}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-muted)]">
                    <tr className="text-left">
                      <th className="px-4 py-3 whitespace-nowrap">
                        {t("adminProduct")}
                      </th>
                      <th className="px-4 py-3 whitespace-nowrap">
                        {t("wilaya")}
                      </th>
                      <th className="px-4 py-3 whitespace-nowrap">
                        {t("price")}
                      </th>
                      <th className="px-4 py-3 whitespace-nowrap">
                        {t("adminUnit")}
                      </th>
                      <th className="px-4 py-3 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center opacity-50 italic"
                        >
                          {t("adminNoItems") || "Aucun prix configuré"}
                        </td>
                      </tr>
                    ) : (
                      items.map((row, idx) => (
                        <tr
                          key={row.id || idx}
                          className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/30"
                        >
                          <td className="px-4 py-2">
                            <select
                              className="form-select text-xs py-1.5"
                              value={row.product || "Poulet"}
                              onChange={(e) => {
                                const product = e.target.value;
                                setItems((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, product } : x
                                  )
                                );
                              }}
                            >
                              {PRODUCT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              className="form-input text-xs py-1.5"
                              value={row.wilaya || ""}
                              onChange={(e) => {
                                const wilaya = e.target.value;
                                setItems((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, wilaya } : x
                                  )
                                );
                              }}
                              placeholder="Alger"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              className="form-input text-xs py-1.5"
                              type="number"
                              min="0"
                              step="1"
                              value={
                                Number.isFinite(Number(row.price))
                                  ? row.price
                                  : 0
                              }
                              onChange={(e) => {
                                const price = Number(e.target.value);
                                setItems((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, price } : x
                                  )
                                );
                              }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              className="form-select text-xs py-1.5"
                              value={row.unit || "kg"}
                              onChange={(e) => {
                                const unit = e.target.value;
                                setItems((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, unit } : x
                                  )
                                );
                              }}
                            >
                              {UNIT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 p-1"
                              title={t("delete")}
                              onClick={() => {
                                setItems((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                );
                              }}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
