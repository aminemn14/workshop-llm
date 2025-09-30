"use client";
import { useStore } from "@/lib/useStore";

export default function StepProgress() {
  const steps = useStore((s) => s.steps);
  return (
    <ol className="space-y-2">
      {steps.map((s) => (
        <li key={s.id} className="flex items-center gap-2 text-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              s.status === "done"
                ? "bg-green-500"
                : s.status === "error"
                ? "bg-red-500"
                : s.status === "running"
                ? "bg-amber-500 animate-pulseSoft"
                : "bg-gray-300"
            }`}
          />
          <span className="flex-1">{s.label}</span>
          <span className="text-xs text-[var(--neutral)]">{s.status}</span>
        </li>
      ))}
    </ol>
  );
}
