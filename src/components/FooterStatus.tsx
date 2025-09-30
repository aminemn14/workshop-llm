"use client";
export default function FooterStatus() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4">
      <div className="badge text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
        En ligne
      </div>
      <button className="btn btn-green">À jour v3.11.11</button>
    </div>
  );
}
