"use client";
import React from "react";
import TopBar from "@/components/TopBar";
import SidePanel from "@/components/SidePanel";
import ResultsPanel from "@/components/ResultsPanel";
import FooterStatus from "@/components/FooterStatus";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <TopBar />
      <div className="flex-1 grid grid-cols-[minmax(420px,34%)_1fr] gap-4 p-4 xl:p-6">
        <div className="h-[calc(100vh-44px-56px)] xl:h-[calc(100vh-44px-60px)] overflow-y-auto scrollbar hidden lg:block">
          <SidePanel />
        </div>
        <div className="min-h-[420px]">
          <ResultsPanel />
        </div>
      </div>
      <div className="lg:hidden px-4 pb-24">
        <SidePanel accordion />
      </div>
      <FooterStatus />
    </div>
  );
}
