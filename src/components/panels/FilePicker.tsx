"use client";
import { useRef } from "react";
import { useStore } from "@/lib/useStore";

export default function FilePicker() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const files = useStore((s) => s.files);
  const setFiles = useStore((s) => s.setFiles);
  const clearFiles = useStore((s) => s.clearFiles);
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Fichiers PDF</div>
        <div className="flex gap-2">
          <button className="btn btn-gray" onClick={() => clearFiles()}>
            Effacer
          </button>
          <button
            className="btn btn-blue"
            onClick={() => inputRef.current?.click()}
          >
            Choisir
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const list = e.target.files ? Array.from(e.target.files) : [];
          setFiles(list);
        }}
      />
      <ul className="mt-2 space-y-1 text-sm max-h-32 overflow-auto scrollbar">
        {files.map((f, i) => (
          <li key={i} className="truncate">
            {f.name}
          </li>
        ))}
        {files.length === 0 && (
          <li className="text-[var(--neutral)]">Aucun fichier</li>
        )}
      </ul>
    </div>
  );
}
