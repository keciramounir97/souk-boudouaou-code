import { useCallback, useMemo } from "react";
import { useCategories } from "../context/categoryContext";
import { useTranslation } from "../context/translationContext";
import { normalizeCategoryValue } from "../utils/images";

export function useCategoryOptions({ includeHidden = false } = {}) {
  const { language, t } = useTranslation();
  const { categories, visibleCategories, accentFor, labelFor } = useCategories();

  const source = includeHidden ? categories : visibleCategories;

  const options = useMemo(
    () =>
      source.map((cat) => ({
        ...cat,
        label:
          labelFor(cat.value, language, t) ||
          cat.labels?.[language] ||
          cat.value,
      })),
    [labelFor, language, source, t]
  );

  const labelForValue = useCallback(
    (value) => labelFor(value, language, t),
    [labelFor, language, t]
  );

  const accentForValue = useCallback(
    (value) => accentFor(normalizeCategoryValue(value)),
    [accentFor]
  );

  const hasValue = useCallback(
    (value) =>
      categories.some(
        (cat) =>
          normalizeCategoryValue(cat.value) ===
          normalizeCategoryValue(value || "")
      ),
    [categories]
  );

  return {
    options,
    categories: source,
    labelFor: labelForValue,
    accentFor: accentForValue,
    hasValue,
  };
}
