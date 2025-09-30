"use client";
import { useStore } from "@/lib/useStore";

export default function MonitoringPanel() {
  const monitoring = useStore((s) => s.monitoring);
  const setMonitoring = useStore((s) => s.setMonitoring);
  const metrics = useStore((s) => s.metrics);
  return (
    <div className="card p-3 space-y-2">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={monitoring}
          onChange={(e) => setMonitoring(e.target.checked)}
        />
        Monitoring avancé
      </label>
      <div className="grid grid-cols-3 gap-2 text-xs opacity-80">
        <div className="card p-2">CPU {metrics.cpu}%</div>
        <div className="card p-2">Mémoire {metrics.ram}%</div>
        <div className="card p-2">Disque {metrics.disk}%</div>
      </div>
      <div className="card p-6 text-sm text-[var(--neutral)] min-h-32 flex items-center justify-center">
        {monitoring
          ? "Graphiques (placeholder)"
          : "Activer le monitoring pour afficher les graphiques"}
      </div>
    </div>
  );
}
