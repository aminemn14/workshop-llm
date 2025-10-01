"use client";

import React from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/hooks/useAuth';
import ApiKeysManager from '@/components/ApiKeysManager';

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Profil</h1>
            <p className="mt-2 text-sm text-gray-600">
              Bienvenue sur votre page de profil
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID Utilisateur
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 font-mono break-all">
                  {user.id}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dernière connexion
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900">
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleString('fr-FR')
                    : 'Non disponible'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <ApiKeysManager />
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retour
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
