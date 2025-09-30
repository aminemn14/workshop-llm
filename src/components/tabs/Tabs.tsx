"use client";
import { useEffect, useMemo, useRef } from "react";
import { useStore, type TabKey, type LogEntry, type LogLevel } from "@/lib/useStore";
import {
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  BugAntIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

const tabs: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: "summary", label: "Résumé", icon: DocumentTextIcon },
  { key: "config", label: "Configurations", icon: Cog6ToothIcon },
  { key: "preimport", label: "Pré-import", icon: ArrowDownTrayIcon },
  { key: "logs", label: "Logs", icon: ListBulletIcon },
  { key: "debug", label: "Debug", icon: BugAntIcon },
];

function TabContent() {
  const active = useStore((s) => s.activeTab);
  const logs = useStore((s) => s.logs);
  const summaryText = useStore((s) => s.summaryText);
  const logFilter = useStore((s) => s.logFilter);
  const logSearch = useStore((s) => s.logSearch);
  const setLogFilter = useStore((s) => s.setLogFilter);
  const setLogSearch = useStore((s) => s.setLogSearch);
  const clearLogs = useStore((s) => s.clearLogs);
  const autoScroll = useStore((s) => s.autoScrollLogs);
  const setAutoScroll = useStore((s) => s.setAutoScrollLogs);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = logSearch.trim().toLowerCase();
    return logs.filter((l: LogEntry) =>
      logFilter[l.level] && (!normalizedQuery || `${l.message}`.toLowerCase().includes(normalizedQuery))
    );
  }, [logs, logFilter, logSearch]);

  useEffect(() => {
    if (active !== "logs") return;
    if (!autoScroll) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [filteredLogs, active, autoScroll]);

  const onExport = () => {
    const lines = filteredLogs.map((l) => {
      const ts = new Date(l.timestamp).toISOString();
      return `[${ts}] ${l.level} ${l.message}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const levelClass = (lvl: LogLevel) =>
    lvl === "ERROR" ? "text-red-600" : lvl === "WARNING" ? "text-amber-600" : lvl === "DEBUG" ? "text-gray-500" : "text-green-600";

  return (
    <div className="card p-3 min-h-[420px] overflow-hidden">
      {active === "summary" && (
        <div className="text-sm whitespace-pre-wrap">
          {summaryText || (
            <span className="text-[var(--neutral)]">
              Résumé automatique des résultats. Sélectionnez un PDF pour lancer
              l'analyse et afficher le résumé ici.
            </span>
          )}
        </div>
      )}
      {active === "config" && (
        <div className="text-sm">
          Configurations actuelles. Ajustez les paramètres dans la colonne de
          gauche.
        </div>
      )}
      {active === "preimport" && (
        <div className="text-sm">
          Préparation de l'import des PDF, normalisation des données.
        </div>
      )}
      {active === "logs" && (
        <div className="flex flex-col gap-2 min-h-[380px]">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={logFilter.INFO} onChange={(e) => setLogFilter("INFO", e.target.checked)} />
                <span className="text-green-600">INFO</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={logFilter.WARNING} onChange={(e) => setLogFilter("WARNING", e.target.checked)} />
                <span className="text-amber-600">WARNING</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={logFilter.ERROR} onChange={(e) => setLogFilter("ERROR", e.target.checked)} />
                <span className="text-red-600">ERROR</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={logFilter.DEBUG} onChange={(e) => setLogFilter("DEBUG", e.target.checked)} />
                <span className="text-gray-600">DEBUG</span>
              </label>
            </div>
            <input
              className="card p-1.5 text-xs flex-1"
              placeholder="Rechercher dans les logs"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              aria-label="Recherche logs"
            />
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
              Auto-scroll
            </label>
            <button className="btn btn-gray" onClick={clearLogs}>Vider</button>
            <button className="btn btn-gray" onClick={onExport}>Exporter</button>
          </div>
          <div ref={containerRef} className="text-xs leading-relaxed whitespace-pre-wrap overflow-auto scrollbar flex-1 border border-[var(--border)] rounded p-2">
            {filteredLogs.length === 0 ? (
              <span className="text-[var(--neutral)]">Aucun log</span>
            ) : (
              filteredLogs.map((l) => (
                <div key={l.id} className="flex gap-2">
                  <span className="text-[var(--neutral)] min-w-[170px]">{new Date(l.timestamp).toLocaleTimeString()} · {new Date(l.timestamp).toLocaleDateString()}</span>
                  <span className={`font-medium ${levelClass(l.level)} min-w-[64px]`}>{l.level}</span>
                  <span className="flex-1">{l.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {active === "debug" && (
        <div className="text-sm">Outils de debug et rapport détaillé.</div>
      )}
    </div>
  );
}

export default function Tabs() {
  const active = useStore((s) => s.activeTab);
  const setActive = useStore((s) => s.setActiveTab);
  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Résultats"
        className="flex items-center gap-2"
      >
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={active === key}
            aria-controls={`panel-${key}`}
            id={`tab-${key}`}
            onClick={() => setActive(key)}
            className={`btn ${active === key ? "btn-blue" : "btn-gray"}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      <div
        id={`panel-${active}`}
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
      >
        <TabContent />
      </div>
    </div>
  );
}
