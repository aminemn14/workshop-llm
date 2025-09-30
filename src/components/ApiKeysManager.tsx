"use client";

import React, { useState } from 'react';
import { useApiKeys } from '@/hooks/useApiKeys';
import { LLMProvider, PROVIDER_LABELS, PROVIDER_DESCRIPTIONS } from '@/types/api-keys';
import { SimpleEncryption } from '@/lib/encryption';
import { KeyIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ApiKeysManager() {
  const { apiKeys, loading, error, saveApiKey, deleteApiKey, hasApiKey } = useApiKeys();
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveApiKey = async (provider: LLMProvider) => {
    if (!newApiKey.trim()) return;
    
    setSaving(true);
    const result = await saveApiKey({ provider, api_key: newApiKey });
    
    if (result.success) {
      setEditingProvider(null);
      setNewApiKey('');
    }
    setSaving(false);
  };

  const handleDeleteApiKey = async (provider: LLMProvider) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la clé API pour ${PROVIDER_LABELS[provider]} ?`)) {
      await deleteApiKey(provider);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Clés API</h3>
        <p className="text-sm text-gray-500">Gérez vos clés API pour les différents fournisseurs LLM</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="space-y-3">
        {Object.values(LLMProvider).map((provider) => {
          const hasKey = hasApiKey(provider);
          const isEditing = editingProvider === provider;

          return (
            <div key={provider} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <KeyIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{PROVIDER_LABELS[provider]}</h4>
                    <p className="text-sm text-gray-500">
                      {PROVIDER_DESCRIPTIONS[provider]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {hasKey ? 'Clé API configurée' : 'Aucune clé API'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasKey && !isEditing && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-600 font-mono">
                        {SimpleEncryption.maskApiKey(apiKeys.find(k => k.provider === provider)?.api_key_encrypted || '')}
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Configurée
                      </span>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Entrez votre clé API"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        disabled={saving}
                      />
                      <button
                        onClick={() => handleSaveApiKey(provider)}
                        disabled={saving || !newApiKey.trim()}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingProvider(null);
                          setNewApiKey('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProvider(provider)}
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                      >
                        <PlusIcon className="w-4 h-4" />
                        {hasKey ? 'Modifier' : 'Ajouter'}
                      </button>
                      {hasKey && (
                        <button
                          onClick={() => handleDeleteApiKey(provider)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p>• Vos clés API sont chiffrées et stockées de manière sécurisée</p>
        <p>• Elles sont automatiquement chargées lors du changement de fournisseur</p>
        <p>• Seules les clés actives sont utilisées pour l'enrichissement LLM</p>
      </div>
    </div>
  );
}
