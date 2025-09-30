"use client";
import { useStore } from "@/lib/useStore";

export default function ClientCommand() {
  const files = useStore((s) => s.files);
  const processing = useStore((s) => s.processing);
  const start = useStore((s) => s.analyzeFiles);
  const clientOrder = useStore((s) => s.clientOrder);
  const setClientOrder = useStore((s) => s.setClientOrder);
  const useLLM = useStore((s) => s.useLLM);
  return (
    <div className="card p-3 space-y-2">
      <label htmlFor="cmd" className="text-sm">
        Commande client
      </label>
      <input
        id="cmd"
        aria-label="Commande client"
        className="card p-2 text-sm w-full"
        placeholder="ex: Extraire tableaux et résumer"
        value={clientOrder}
        onChange={(e) => setClientOrder(e.target.value)}
      />
      <button
        className="btn btn-blue w-full disabled:opacity-50"
        disabled={!files.length || processing}
        onClick={() => start(files)}
      >
        {processing ? "Traitement..." : "Traiter fichiers"}
      </button>
      {!useLLM && (
        <div className="text-xs text-[var(--neutral)]">
          Enrichissement LLM désactivé : l'analyse ne lancera pas la progression.
        </div>
      )}
    </div>
  );
}
