"use client";
import {
  FolderOpenIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function ActionsBar() {
  return (
    <div className="flex items-center gap-2">
      <button className="btn btn-gray">
        <FolderOpenIcon className="w-4 h-4" /> Ouvrir dossier
      </button>
      <button className="btn btn-blue">
        <EyeIcon className="w-4 h-4" /> Voir rapport
      </button>
      <button className="btn btn-gray">
        <ArrowDownTrayIcon className="w-4 h-4" /> Exporter données
      </button>
    </div>
  );
}
