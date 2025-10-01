"use client";
import React from "react";
import { useStore } from "@/lib/useStore";

export default function ProgressPanel() {
  const processing = useStore((s) => s.processing);
  const steps = useStore((s) => s.steps);

  const total = steps.length || 0;
  const done = steps.filter((s) => s.status === "done").length;
  const hasError = steps.some((s) => s.status === "error");
  const running = steps.some((s) => s.status === "running");

  let pct = total ? (done / total) * 100 : 0;
  if (processing) {
    pct = Math.min(99, running ? ((done + 0.6) / total) * 100 : pct);
  } else if (!hasError && done === total) {
    pct = 100;
  }

  return (
    <div className="card">
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <h3 className="text-sm font-medium">Progression</h3>
      </div>

      <div className="p-3">
        {processing || done > 0 ? (
          <div
            className="relative h-2 rounded bg-[var(--muted)] overflow-hidden"
            aria-label="Progression"
          >
            <div
              className={`h-full ${hasError ? "bg-red-500" : "bg-[var(--blue)]"} opacity-80 rounded transition-all duration-500 ease-out`}
              style={{ width: `${pct}%` }}
            />
            <div className="sr-only">
              {hasError ? "Erreur durant l'analyse" : `Avancement ${Math.round(pct)}%`}
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--neutral)]">Prêt</div>
        )}
      </div>
    </div>
  );
}