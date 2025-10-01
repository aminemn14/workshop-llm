"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/useStore";
import { getIsoWeekYear, getWeekNumber } from "@/lib/time";

export default function ArticleSelectionModal() {
  const open = useStore((s) => s.selectionOpen);
  const items = useStore((s) => s.selectionItems);
  const toggle = useStore((s) => s.toggleSelectionItem);
  const confirm = useStore((s) => s.confirmSelection);
  const cancel = useStore((s) => s.cancelSelection);

  const [week, setWeek] = useState(getWeekNumber());
  const [year, setYear] = useState(getIsoWeekYear());

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-labelledby="article-select-title">
      <button className="absolute inset-0 bg-black/40" onClick={cancel} aria-label="Fermer la modale" />
      <div className="relative card w-[min(680px,95vw)] max-h-[80vh] overflow-auto p-3">
        <div id="article-select-title" className="text-sm font-medium mb-2">Sélection des articles à inclure</div>
        {/* choix semaine/année */}
        <div className="flex gap-3 mb-3">
          <div>
            <label className="text-xs text-[var(--neutral)]">Semaine</label>
            <input
              type="number"
              min={1}
              max={53}
              value={week}
              onChange={e => setWeek(Number(e.target.value))}
              className="card p-1 w-16 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--neutral)]">Année</label>
            <input
              type="number"
              min={2020}
              max={2100}
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="card p-1 w-20 text-sm"
            />
          </div>
        </div>
        <div className="text-xs text-[var(--neutral)] mb-3">
          Décochez les éléments à exclure de la version finale.
        </div>
        <div className="space-y-2 mb-3">
          {items.length === 0 ? (
            <div className="text-xs text-[var(--neutral)]">Aucun article détecté.</div>
          ) : (
            items.map((it) => (
              <label key={it.index} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={it.checked}
                  onChange={(e) => toggle(it.index, e.target.checked)}
                />
                <span className="truncate">{it.label}</span>
              </label>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-gray" onClick={cancel}>Annuler</button>
          <button className="btn btn-blue" onClick={() => confirm(week, year)}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}


