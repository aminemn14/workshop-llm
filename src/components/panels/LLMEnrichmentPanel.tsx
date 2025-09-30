"use client";
import { useStore, type ProviderKey } from "@/lib/useStore";
import { WrenchIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { SimpleEncryption } from "@/lib/encryption";
import { LLMProvider, PROVIDER_LABELS } from "@/types/api-keys";

export default function LLMEnrichmentPanel() {
  const provider = useStore((s) => s.provider);
  const setProvider = useStore((s) => s.setProvider);
  const showApiKey = useStore((s) => s.showApiKey);
  const setShowApiKey = useStore((s) => s.setShowApiKey);
  const apiKey = useStore((s) => s.apiKey);
  const setApiKey = useStore((s) => s.setApiKey);
  const apiKeyLoading = useStore((s) => s.apiKeyLoading);
  const apiKeyError = useStore((s) => s.apiKeyError);
  const saveApiKey = useStore((s) => s.saveApiKey);
  const loadApiKeyForProvider = useStore((s) => s.loadApiKeyForProvider);

  const [isEditing, setIsEditing] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastLoadedProvider, setLastLoadedProvider] = useState<ProviderKey | null>(null);

  const valid = apiKey.trim().length > 10;
  const hasApiKey = apiKey.trim().length > 0;

  // Charger la clé API au montage du composant avec debounce
  useEffect(() => {
    // Éviter les appels si on a déjà chargé ce provider
    if (lastLoadedProvider === provider) return;
    
    const timeoutId = setTimeout(() => {
      setLastLoadedProvider(provider);
      loadApiKeyForProvider(provider);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [provider, loadApiKeyForProvider, lastLoadedProvider]);

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) return;
    
    setSaveStatus('saving');
    const success = await saveApiKey(provider, tempApiKey);
    
    if (success) {
      setSaveStatus('success');
      setIsEditing(false);
      setTempApiKey("");
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleEditApiKey = () => {
    setTempApiKey(apiKey);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempApiKey("");
    setSaveStatus('idle');
  };

  return (
    <div className="card p-3 space-y-2">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Configuration LLM
      </div>
      <div className="flex items-center gap-2">
        <select
          aria-label="Fournisseur"
          className="card p-2 text-sm flex-1"
          value={provider}
          onChange={(e) => setProvider(e.target.value as ProviderKey)}
        >
          {Object.values(LLMProvider).map((providerValue) => (
            <option key={providerValue} value={providerValue}>
              {PROVIDER_LABELS[providerValue]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {isEditing ? (
            <input
              aria-label="Clé API"
              type={showApiKey ? "text" : "password"}
              className="card w-full p-2 text-sm"
              placeholder="Entrez votre clé API"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              disabled={saveStatus === 'saving'}
            />
          ) : (
            <div className="card w-full p-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={hasApiKey ? "text-green-600 font-mono" : "text-gray-500"}>
                    {hasApiKey ? SimpleEncryption.maskApiKey(apiKey) : "Aucune clé API configurée"}
                  </span>
                  {hasApiKey && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      Configurée
                    </span>
                  )}
                </div>
                {hasApiKey && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" />
                    Sauvegardée
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex gap-1">
            <button
              className="btn btn-green"
              onClick={handleSaveApiKey}
              disabled={saveStatus === 'saving' || !tempApiKey.trim()}
            >
              {saveStatus === 'saving' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
            </button>
            <button
              className="btn btn-gray"
              onClick={handleCancelEdit}
              disabled={saveStatus === 'saving'}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              className="btn btn-gray"
              onClick={handleEditApiKey}
            >
              <WrenchIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Messages de statut */}
      {apiKeyLoading && (
        <div className="text-xs text-blue-600 flex items-center gap-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          Chargement de la clé API...
        </div>
      )}
      
      {apiKeyError && (
        <div className="text-xs text-red-600">
          Erreur: {apiKeyError}
        </div>
      )}
      
      {saveStatus === 'success' && (
        <div className="text-xs text-green-600 flex items-center gap-1">
          <CheckIcon className="w-3 h-3" />
          Clé API sauvegardée avec succès !
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="text-xs text-red-600 flex items-center gap-1">
          <XMarkIcon className="w-3 h-3" />
          Erreur lors de la sauvegarde
        </div>
      )}

      {!valid && !apiKeyLoading && (
        <div className="text-xs text-red-600">
          Clé API requise pour le traitement des PDF
        </div>
      )}
    </div>
  );
}
