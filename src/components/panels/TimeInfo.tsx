"use client";
import { getIsoWeekYear, getWeekNumber, formatTime } from "@/lib/time";
import { useEffect, useState } from "react";

export default function TimeInfo() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const week = now ? getWeekNumber(now) : null;
  const year = now ? getIsoWeekYear(now) : null;
  const time = now ? formatTime(now) : "";

  return (
    <div className="card p-3 flex items-center gap-2">
      <span className="badge">Semaine {week ?? "—"}</span>
      <span className="badge">Année {year ?? "—"}</span>
      <span className="text-sm text-[var(--neutral)] ml-auto" suppressHydrationWarning>
        {time}
      </span>
    </div>
  );
}
