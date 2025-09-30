"use client";
import ConfigurationPanel from "./panels/ConfigurationPanel";
import FilePicker from "./panels/FilePicker";
import LLMEnrichmentPanel from "./panels/LLMEnrichmentPanel";
import TimeInfo from "./panels/TimeInfo";
import ClientCommand from "./panels/ClientCommand";
import ProgressPanel from "./panels/ProgressPanel";

export default function SidePanel({
  accordion = false,
}: {
  accordion?: boolean;
}) {
  if (accordion) {
    return (
      <div className="space-y-3">
        <details className="card p-0" open>
          <summary className="px-3 py-2 text-sm border-b border-[var(--border)]">
            Panneaux
          </summary>
          <div className="p-3 space-y-3">
            <ConfigurationPanel />
            <FilePicker />
            <LLMEnrichmentPanel />
            <TimeInfo />
            <ClientCommand />
            <ProgressPanel />
          </div>
        </details>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <ConfigurationPanel />
      <FilePicker />
      <LLMEnrichmentPanel />
      <TimeInfo />
      <ClientCommand />
      <ProgressPanel />
    </div>
  );
}
