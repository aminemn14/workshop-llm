"use client";
import { useStore, type ProviderKey } from "@/lib/useStore";
import { KeyIcon, WrenchIcon } from "@heroicons/react/24/outline";

export default function LLMEnrichmentPanel() {
  const useLLM = useStore((s) => s.useLLM);
  const setUseLLM = useStore((s) => s.setUseLLM);
  const provider = useStore((s) => s.provider);
  const setProvider = useStore((s) => s.setProvider);
  const showApiKey = useStore((s) => s.showApiKey);
  const setShowApiKey = useStore((s) => s.setShowApiKey);
  const apiKey = useStore((s) => s.apiKey);
  const setApiKey = useStore((s) => s.setApiKey);
  const valid = !useLLM || apiKey.trim().length > 10;

  return (
    <div className="card p-3 space-y-2">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useLLM}
          onChange={(e) => setUseLLM(e.target.checked)}
        />
        Enrichissement LLM
      </label>
      <div className="flex items-center gap-2">
        <select
          aria-label="Fournisseur"
          className="card p-2 text-sm flex-1"
          value={provider}
          onChange={(e) => setProvider(e.target.value as ProviderKey)}
        >
          <option value="openrouter">OpenRouter</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="local">Local</option>
        </select>
        <button className="btn btn-gray" aria-label="Config">
          <WrenchIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            aria-label="Clé API"
            type={showApiKey ? "text" : "password"}
            className="card w-full p-2 text-sm"
            placeholder="Clé API"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <button
          className="btn btn-gray"
          onClick={() => setShowApiKey(!showApiKey)}
        >
          <KeyIcon className="w-4 h-4" /> {showApiKey ? "Masquer" : "Afficher"}
        </button>
      </div>
      {!valid && <div className="text-xs text-red-600">Clé API invalide</div>}
    </div>
  );
}
