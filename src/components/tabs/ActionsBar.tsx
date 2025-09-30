"use client";
import {
  FolderOpenIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { exportToExcel } from "@/lib/exportExcel";
import { useStore } from "@/lib/useStore";

export default function ActionsBar() {
  const logs = useStore((s) => s.logs);
  const hasData = logs.length > 0;

  const handleExport = () => {
    const rows = (logs.length ? logs : ["Aucune donnée"]).map((line, idx) => ({
      Index: idx + 1,
      Log: line,
    }));
    exportToExcel(rows, { filename: "donnees", sheetName: "Logs" });
  };
  return (
    <div className="flex items-center gap-2">
      <button className="btn btn-gray">
        <FolderOpenIcon className="w-4 h-4" /> Ouvrir dossier
      </button>
      <button className="btn btn-blue">
        <EyeIcon className="w-4 h-4" /> Voir rapport
      </button>
      <button
        className="btn btn-gray disabled:opacity-50"
        disabled={!hasData}
        onClick={handleExport}
      >
        <ArrowDownTrayIcon className="w-4 h-4" /> Exporter données
      </button>
    </div>
  );
}
