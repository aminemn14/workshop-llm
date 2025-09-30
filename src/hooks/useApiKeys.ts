"use client";

import { useState, useEffect, useCallback } from 'react';
import { ApiKeyService } from '@/lib/api-keys';
import { ApiKey, CreateApiKeyRequest, LLMProvider } from '@/types/api-keys';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les clés API de l'utilisateur
  const loadApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const keys = await ApiKeyService.getUserApiKeys();
      setApiKeys(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder une clé API
  const saveApiKey = useCallback(async (request: CreateApiKeyRequest) => {
    try {
      setError(null);
      const result = await ApiKeyService.saveApiKey(request);
      
      if (result.success) {
        // Recharger les clés après sauvegarde
        await loadApiKeys();
        return { success: true };
      } else {
        setError(result.error || 'Erreur lors de la sauvegarde');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [loadApiKeys]);

  // Supprimer une clé API
  const deleteApiKey = useCallback(async (provider: LLMProvider) => {
    try {
      setError(null);
      const result = await ApiKeyService.deleteApiKey(provider);
      
      if (result.success) {
        // Recharger les clés après suppression
        await loadApiKeys();
        return { success: true };
      } else {
        setError(result.error || 'Erreur lors de la suppression');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [loadApiKeys]);

  // Vérifier si une clé existe pour un provider
  const hasApiKey = useCallback((provider: LLMProvider) => {
    return apiKeys.some(key => key.provider === provider && key.active);
  }, [apiKeys]);

  // Charger les clés au montage du composant
  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  return {
    apiKeys,
    loading,
    error,
    loadApiKeys,
    saveApiKey,
    deleteApiKey,
    hasApiKey,
  };
}

// Hook pour récupérer une clé API spécifique
export function useApiKey(provider: LLMProvider) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApiKey = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const key = await ApiKeyService.getApiKeyForProvider(provider);
      setApiKey(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  return {
    apiKey,
    loading,
    error,
    loadApiKey,
  };
}
