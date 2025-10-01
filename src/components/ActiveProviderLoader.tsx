"use client";

import React from 'react';
import { useActiveProvider } from '@/hooks/useActiveProvider';

interface ActiveProviderLoaderProps {
  children: React.ReactNode;
}

export function ActiveProviderLoader({ children }: ActiveProviderLoaderProps) {
  // Charger le provider actif au démarrage
  useActiveProvider();

  return <>{children}</>;
}
