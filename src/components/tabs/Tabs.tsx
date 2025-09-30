"use client";
import { useStore, type TabKey } from "@/lib/useStore";
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
  return (
    <div className="card p-3 min-h-[420px] overflow-auto scrollbar">
      {active === "summary" && (
        <div className="text-sm text-[var(--neutral)]">
          Résumé automatique des résultats. Sélectionnez des fichiers et lancez
          le traitement.
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
        <pre className="text-xs leading-relaxed whitespace-pre-wrap">
          {logs.join("\n") || "Aucun log"}
        </pre>
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
