"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/useStore";

export default function ThemeClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const dark = useStore((s) => s.dark);

  useEffect(() => {
    const root = document.documentElement; // <html>
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return <>{children}</>;
}
