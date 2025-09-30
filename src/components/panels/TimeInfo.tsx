"use client";
import { getIsoWeekYear, getWeekNumber, formatTime } from "@/lib/time";
import { useEffect, useState } from "react";

export default function TimeInfo() {
  const [time, setTime] = useState(formatTime());
  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);
  const week = getWeekNumber();
  const year = getIsoWeekYear();
  return (
    <div className="card p-3 flex items-center gap-2">
      <span className="badge">Semaine {week}</span>
      <span className="badge">Année {year}</span>
      <span className="text-sm text-[var(--neutral)] ml-auto">{time}</span>
    </div>
  );
}
