"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/useStore';
import { useAuth } from './useAuth';

export function useActiveProvider() {
  const { user, loading } = useAuth();
  const loadActiveProvider = useStore((s) => s.loadActiveProvider);
  const provider = useStore((s) => s.provider);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (user && !loading && !provider && !hasLoaded) {
      // Charger le provider actif seulement une fois
      setHasLoaded(true);
      const timeoutId = setTimeout(() => {
        loadActiveProvider();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [user, loading, provider, hasLoaded, loadActiveProvider]);
}
