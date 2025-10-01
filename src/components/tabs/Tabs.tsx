"use client";
import { useEffect, useMemo, useRef } from "react";
import { useStore, type TabKey, type LogEntry, type LogLevel } from "@/lib/useStore";
import {
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ListBulletIcon,
  CodeBracketIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import CalculatedParametersTable from "./InvoiceInfoTable";

const tabs: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: "summary", label: "Résumé", icon: DocumentTextIcon },
  { key: "config", label: "Configurations", icon: Cog6ToothIcon },
  { key: "preimport", label: "Pré-import", icon: ArrowDownTrayIcon },
  { key: "logs", label: "Logs", icon: ListBulletIcon },
  { key: "json", label: "JSON", icon: CodeBracketIcon },
  { key: "costs", label: "Coûts", icon: CurrencyDollarIcon },
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
  const llmMessages = useStore((s) => s.llmMessages);
  const commandData = useStore((s) => s.commandData);
  const usage = useStore((s) => s.usage);
  const model = useStore((s) => s.model);
  const costIn = useStore((s) => s.costInputUSD);
  const costOut = useStore((s) => s.costOutputUSD);
  const costTotal = useStore((s) => s.costTotalUSD);

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
  <div className="space-y-4">
    <div className="text-sm font-medium text-[var(--neutral)]">
      Configurations extraites du PDF
    </div>
    {Array.isArray(commandData?.articles) && commandData.articles.length > 0 ? (
      <div className="overflow-auto">
        <table className="min-w-full border border-[var(--border)] rounded text-xs">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="p-2">Index</th>
              <th className="p-2">Type</th>
              <th className="p-2">Description</th>
              <th className="p-2">Titre côté</th>
              <th className="p-2">Information</th>
              <th className="p-2">Quantité</th>
              <th className="p-2">Dimensions</th>
              <th className="p-2">Noyau</th>
              <th className="p-2">Fermeté</th>
              <th className="p-2">Housse</th>
              <th className="p-2">Matière housse</th>
              <th className="p-2">Autres caractéristiques</th>
              <th className="p-2">Mode de mise à disposition</th>
            </tr>
          </thead>
          <tbody>
            {commandData.articles.map((matelas, idx) => (
              <tr key={idx} className="border-t border-[var(--border)]">
                <td className="p-2 text-center">{idx + 1}</td>
                <td className="p-2">{matelas.type}</td>
                <td className="p-2">{matelas.description}</td>
                <td className="p-2">{matelas.titre_cote}</td>
                <td className="p-2">{matelas.information}</td>
                <td className="p-2 text-center">{matelas.quantite}</td>
                <td className="p-2">{matelas.dimensions}</td>
                <td className="p-2">{matelas.noyau}</td>
                <td className="p-2">{matelas.fermete}</td>
                <td className="p-2">{matelas.housse}</td>
                <td className="p-2">{matelas.matiere_housse}</td>
                <td className="p-2">{matelas.autres_caracteristiques ? JSON.stringify(matelas.autres_caracteristiques) : ""}</td>
                <td className="p-2">
                  {commandData?.mode_mise_a_disposition
                    ? Object.entries(commandData.mode_mise_a_disposition)
                        .map(([k, v]) => v ? `${k.replace("_C57", "").replace("_C58", "").replace("_C59", "")}: ${v}` : "")
                        .filter(Boolean)
                        .join(", ")
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-[var(--neutral)]">Aucune configuration extraite.</div>
    )}
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
      {active === "json" && (
        <div className="gap-3 text-xs">
          {/* <div className="card p-2 overflow-auto scrollbar min-h-[360px]">
            <div className="font-medium mb-2">Messages LLM</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(llmMessages, null, 2)}</pre>
          </div> */}
          <div className="card p-2 overflow-auto scrollbar min-h-[360px]">
            <div className="font-medium mb-2">Données commande</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(commandData, null, 2)}</pre>
          </div>
        </div>
      )}
      {active === "costs" && (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-3">
              <div className="text-xs text-[var(--neutral)]">Modèle</div>
              <div className="font-semibold">{model || "n/a"}</div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-[var(--neutral)]">Tokens prompt / output</div>
              <div className="font-semibold">{usage ? `${usage.prompt_tokens} / ${usage.completion_tokens}` : "n/a"}</div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-[var(--neutral)]">Total tokens</div>
              <div className="font-semibold">{usage ? usage.total_tokens : "n/a"}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-3">
              <div className="text-xs text-[var(--neutral)]">Coût input (USD)</div>
              <div className="font-semibold">{costIn.toFixed(6)}</div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-[var(--neutral)]">Coût output (USD)</div>
              <div className="font-semibold">{costOut.toFixed(6)}</div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-[var(--neutral)]">Coût total (USD)</div>
              <div className="font-semibold">{costTotal.toFixed(6)}</div>
            </div>
          </div>
          {!usage && (
            <div className="text-xs text-[var(--neutral)]">Aucune donnée d'usage reçue pour cette requête.</div>
          )}
        </div>
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
