"use client";
import React from "react";
import { useStore } from "@/lib/useStore";

export default function ProgressPanel() {
  const processing = useStore((s) => s.processing);

  return (
    <div className="card">
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <h3 className="text-sm font-medium">Progression</h3>
      </div>

      <div className="p-3">
        {processing ? (
          <div
            className="relative h-2 rounded bg-[var(--muted)] overflow-hidden"
            aria-label="Chargement en cours"
          >
            <div className="absolute inset-0">
              <div className="h-full w-1/3 bg-[var(--blue)] opacity-80 animate-[indeterminate_1.2s_ease_infinite] rounded" />
            </div>
            <div className="sr-only">Analyse en cours…</div>
          </div>
        ) : (
          <div className="text-xs text-[var(--neutral)]">Prêt</div>
        )}
      </div>

      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(150%);
          }
        }
      `}</style>
    </div>
  );
}