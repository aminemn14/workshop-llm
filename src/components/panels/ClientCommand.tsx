"use client";
import { useStore } from "@/lib/useStore";

export default function ClientCommand() {
  const files = useStore((s) => s.files);
  const processing = useStore((s) => s.processing);
  const start = useStore((s) => s.startProcessing);
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
      />
      <button
        className="btn btn-blue w-full disabled:opacity-50"
        disabled={!files.length || processing}
        onClick={start}
      >
        {processing ? "Traitement..." : "Traiter fichiers"}
      </button>
    </div>
  );
}
