"use client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStore } from "@/lib/useStore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function TopBar() {
  const processing = useStore((s) => s.processing);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="h-11 border-b border-[var(--border)] flex items-center justify-between px-3 bg-[var(--card)]">
      <div className="text-sm text-[var(--neutral)] flex items-center gap-4">
        <button className="hover:underline">Fichier</button>
        <button className="hover:underline">Édition</button>
        <button className="hover:underline">Affichage</button>
        <button className="hover:underline">Aide</button>
      </div>
      <div className="text-sm text-[var(--neutral)]">
        {user && (
          <span>Connecté en tant que: {user.email}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <Link 
              href="/profile" 
              className="text-sm text-[var(--neutral)] hover:underline"
            >
              Profil
            </Link>
            <button 
              onClick={handleSignOut}
              className="text-sm text-[var(--neutral)] hover:underline"
            >
              Déconnexion
            </button>
          </>
        )}
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            processing ? "bg-[#f0ad4e] animate-pulseSoft" : "bg-[#23b26e]"
          }`}
          aria-label={processing ? "En cours" : "Prêt"}
        />
        <ThemeToggle />
      </div>
    </div>
  );
}
