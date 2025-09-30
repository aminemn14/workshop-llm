"use client";
import Tabs from "./tabs/Tabs";
import ActionsBar from "./tabs/ActionsBar";
// import MonitoringPanel from "./tabs/MonitoringPanel";

export default function ResultsPanel() {
  return (
    <div className="card p-3 flex flex-col gap-3 min-h-[420px]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Résultats</h2>
      </div>
      <Tabs />
      <ActionsBar />
      {/* <MonitoringPanel /> */}
    </div>
  );
}
