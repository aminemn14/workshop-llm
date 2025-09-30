"use client";
import React from "react";
import { useStore } from "@/lib/useStore";

export default function ProgressPanel() {
  const processing = useStore((s) => s.processing);

  return (
    <div className="rounded-md border border-gray-300 bg-white dark:bg-[#1f2937] dark:border-[#374151]">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-[#374151]">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Progression
        </h3>
      </div>

      <div className="p-3">
        {processing ? (
          <div className="relative h-2 rounded bg-gray-200 overflow-hidden dark:bg-[#374151]" aria-label="Chargement en cours">
            <div className="absolute inset-0">
              <div className="h-full w-1/3 bg-[#1f64c9] opacity-80 animate-[indeterminate_1.2s_ease_infinite] rounded" />
            </div>
            {/* Fallback simple si la keyframe n'est pas supportée */}
            <div className="sr-only">Analyse en cours…</div>
          </div>
        ) : (
          <div className="text-xs text-gray-600 dark:text-gray-300">Prêt</div>
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
