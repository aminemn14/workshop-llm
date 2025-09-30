"use client";

import React from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
