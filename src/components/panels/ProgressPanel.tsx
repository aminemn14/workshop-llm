"use client";
import React, { useEffect, useMemo, useState } from "react";

type StepStatus = "idle" | "running" | "done" | "error";

type Step = {
  id: string;
  label: string;
  status: StepStatus;
};

export default function ProgressPanel() {
  const [steps, setSteps] = useState<Step[]>([
    { id: "parse", label: "File parsing", status: "idle" },
    { id: "extract", label: "Extraction", status: "idle" },
    { id: "enrich", label: "Enrichissement LLM", status: "idle" },
    { id: "export", label: "Export", status: "idle" },
  ]);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [cpu, setCpu] = useState(29);
  const [ram, setRam] = useState(40);

  // Simu CPU/RAM
  useEffect(() => {
    const t = setInterval(() => {
      setCpu((v) => Math.max(5, Math.min(95, v + (Math.random() * 8 - 4))));
      setRam((v) => Math.max(10, Math.min(95, v + (Math.random() * 6 - 3))));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  // Simu progression quand processing
  useEffect(() => {
    if (!processing) return;
    let i = 0;
    const run = async () => {
      for (i = 0; i < steps.length; i++) {
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
        );
        // 10% d'échec simulé
        const fail = Math.random() < 0.1;
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 800));
        if (fail) {
          setSteps((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: "error" } : s))
          );
          setProcessing(false);
          return;
        }
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s))
        );
        setProgress(Math.round(((i + 1) / steps.length) * 100));
      }
      setProcessing(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  const canRetry = useMemo(
    () => steps.some((s) => s.status === "error"),
    [steps]
  );

  const start = () => {
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle" })));
    setProgress(0);
    setProcessing(true);
  };

  const retry = () => {
    setProcessing(true);
  };

  const statusDot = (st: StepStatus) => {
    const map: Record<StepStatus, string> = {
      idle: "bg-gray-300",
      running: "bg-blue-500 animate-pulse",
      done: "bg-green-500",
      error: "bg-red-500",
    };
    return (
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${map[st]}`} />
    );
  };

  return (
    <div className="rounded-md border border-gray-300 bg-white dark:bg-[#1f2937] dark:border-[#374151]">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-[#374151]">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Progression
        </h3>
      </div>

      <div className="p-3 space-y-3">
        <ul className="space-y-2">
          {steps.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-sm">
              {statusDot(s.status)}
              <span className="text-gray-800 dark:text-gray-200">
                {s.label}
              </span>
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 capitalize">
                {s.status}
              </span>
            </li>
          ))}
        </ul>

        {/* Barre de progression */}
        <div className="relative h-2 rounded bg-gray-200 overflow-hidden dark:bg-[#374151]">
          <div
            className="absolute inset-y-0 left-0 rounded bg-[#1f64c9] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {progress}%
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-[#1f64c9] text-white hover:bg-[#1854ab] active:bg-[#154a97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-300 disabled:opacity-60"
            onClick={start}
            disabled={processing}
          >
            {processing ? (
              <span className="inline-block h-4 w-4 animate-spin border-2 border-white/60 border-t-transparent rounded-full mr-2" />
            ) : null}
            {processing ? "Traitement..." : "Traiter"}
          </button>

          {canRetry && !processing && (
            <button
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-300"
              onClick={retry}
            >
              Réessayer
            </button>
          )}
        </div>

        {/* Mini status CPU/RAM */}
        <div className="text-xs text-gray-600 dark:text-gray-300">
          CPU: {Math.round(cpu)}% &nbsp; RAM: {Math.round(ram)}%
        </div>
      </div>
    </div>
  );
}
