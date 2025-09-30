"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/useStore";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
  const dark = useStore((s) => s.dark);
  const toggleDark = useStore((s) => s.toggleDark);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
  }, [dark]);
  return (
    <button
      aria-label="Basculer le thème"
      className="btn btn-gray"
      onClick={toggleDark}
    >
      {dark ? (
        <SunIcon className="w-4 h-4" />
      ) : (
        <MoonIcon className="w-4 h-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
