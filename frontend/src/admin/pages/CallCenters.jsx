import React, { useEffect, useState } from "react";
import { Phone, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import {
  adminGetFooterSettings,
  adminUpdateFooterSettings,
} from "../../api/dataService";
import { useTranslation } from "../../context/translationContext";
import { useToast } from "../../context/ToastContext";

export default function CallCenters() {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ callCenters: [] });
  // local copy for optimistic updates or edit workflow
  const [numbers, setNumbers] = useState([]);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const json = await adminGetFooterSettings();
      const footer = json?.data?.footer || json?.footer || { callCenters: [] };
      setData(footer);
      setNumbers(footer.callCenters || []);
    } catch (e) {
      console.error(e);
      toast.error(t("loadFailed") || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveAll = async (newNumbers) => {
    setSaving(true);
    try {
      const payload = { footer: { ...data, callCenters: newNumbers } };
      await adminUpdateFooterSettings(payload);
      setNumbers(newNumbers);
      setData((prev) => ({ ...prev, callCenters: newNumbers }));
      toast.success(t("savedSuccessfully") || "Sauvegardé avec succès");
    } catch (e) {
      toast.error(t("saveFailed") || "Erreur lors de la sauvegarde");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (idx) => {
    if (!window.confirm(t("confirmDelete") || "Supprimer ?")) return;
    const next = numbers.filter((_, i) => i !== idx);
    saveAll(next);
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
    setEditValue(numbers[idx]);
    setIsAdding(false);
  };

  const saveEdit = async () => {
    if (!editValue.trim()) return;
    const next = [...numbers];
    next[editingIndex] = editValue.trim();
    setEditingIndex(-1);
    await saveAll(next);
  };

  const startAdd = () => {
    setIsAdding(true);
    setNewValue("");
    setEditingIndex(-1);
  };

  const saveAdd = async () => {
    if (!newValue.trim()) return;
    const next = [...numbers, newValue.trim()];
    setIsAdding(false);
    await saveAll(next);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between p-1">
        <div>
          <h1 className="responsive-title flex items-center gap-3">
            <Phone className="text-[var(--category-accent)]" />
            {t("callCenters") || "Centres d'appel"}
          </h1>
          <p className="text-sm opacity-60 mt-1">
            {t("callCentersHint") || "Gérez les numéros du centre d'appel."}
          </p>
        </div>
        <button
          onClick={startAdd}
          disabled={isAdding}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t("create") || "Ajouter"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 opacity-50">{t("loading")}</div>
      ) : (
        <div className="space-y-4">
          {/* Add Form */}
          {isAdding && (
            <div className="detail-card border-l-4 border-l-[var(--category-accent)] animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase opacity-50 mb-1 block">
                    Nouveau numéro
                  </label>
                  <input
                    autoFocus
                    className="field font-mono text-lg"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="+213 ..."
                  />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <button
                    onClick={saveAdd}
                    disabled={saving || !newValue.trim()}
                    className="btn-primary p-3"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    disabled={saving}
                    className="btn-secondary p-3 text-red-500 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {numbers.length === 0 && !isAdding && (
            <div className="text-center py-12 bg-[var(--color-surface)] rounded-2xl border border-dashed border-[var(--color-border)] opacity-60">
              <Phone className="w-10 h-10 mx-auto mb-3 opacity-20" />
              {t("noData") || "Aucun numéro."}
            </div>
          )}

          {numbers.map((num, idx) => (
            <div
              key={idx}
              className="detail-card flex items-center justify-between group hover:shadow-md transition-all"
            >
              {editingIndex === idx ? (
                <div className="flex-1 flex items-center gap-4">
                  <input
                    className="field font-mono text-lg flex-1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingIndex(-1)}
                    disabled={saving}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--category-accent)]/10 flex items-center justify-center text-[var(--category-accent)]">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="font-mono text-lg font-semibold">{num}</div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(idx)}
                      className="p-2 hover:bg-[var(--category-accent)]/10 text-[var(--category-accent)] rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
