"use client";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function ConfigurationPanel() {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-2">
        <Cog6ToothIcon className="w-5 h-5 text-[var(--neutral)]" />
        <div>
          <div className="font-medium">Configuration</div>
          <div className="text-xs text-[var(--neutral)]">v1.2.0</div>
        </div>
      </div>
    </div>
  );
}
