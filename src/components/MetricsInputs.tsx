"use client";
import { useStore } from "@/lib/useStore";

export default function MetricsInputs() {
  const metrics = useStore((s) => s.metrics);
  return (
    <div className="grid grid-cols-3 gap-2 text-xs opacity-80">
      <div className="card p-2">CPU {metrics.cpu}%</div>
      <div className="card p-2">RAM {metrics.ram}%</div>
      <div className="card p-2">Disque {metrics.disk}%</div>
    </div>
  );
}
