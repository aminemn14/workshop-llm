import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type StepStatus = "idle" | "running" | "done" | "error";

export type Step = {
  id: string;
  label: string;
  status: StepStatus;
};

export type TabKey = "summary" | "config" | "preimport" | "logs" | "debug";

export type ProviderKey = "openai" | "anthropic" | "local" | "openrouter";

export type Metrics = {
  cpu: number;
  ram: number;
  disk: number;
};

type Store = {
  files: File[];
  processing: boolean;
  logs: string[];
  activeTab: TabKey;
  provider: ProviderKey;
  useLLM: boolean;
  showApiKey: boolean;
  apiKey: string;
  steps: Step[];
  metrics: Metrics;
  monitoring: boolean;
  dark: boolean;
  summaryText: string;
  clientOrder: string;

  setFiles: (files: File[]) => void;
  clearFiles: () => void;
  setActiveTab: (tab: TabKey) => void;
  setProvider: (p: ProviderKey) => void;
  setUseLLM: (v: boolean) => void;
  setShowApiKey: (v: boolean) => void;
  setApiKey: (k: string) => void;
  startProcessing: () => void;
  retryProcessing: () => void;
  appendLog: (line: string) => void;
  setMonitoring: (v: boolean) => void;
  toggleDark: () => void;
  setClientOrder: (v: string) => void;
  setSummaryText: (v: string) => void;
  analyzeFiles: (files: File[]) => Promise<void>;
};

const initialSteps: Step[] = [
  { id: "prepare", label: "Préparation", status: "idle" },
  { id: "parse", label: "Parsing PDF", status: "idle" },
  { id: "analyze", label: "Analyse LLM", status: "idle" },
  { id: "finalize", label: "Finalisation", status: "idle" },
];

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
  files: [],
  processing: false,
  logs: [],
  activeTab: "summary",
  provider: "openrouter",
  useLLM: true,
  showApiKey: false,
  apiKey: "",
  steps: initialSteps,
  metrics: { cpu: 8, ram: 42, disk: 71 },
  monitoring: false,
  dark: false,
  summaryText: "",
  clientOrder: "",

  setFiles: (files) => set({ files }),
  clearFiles: () => set({ files: [] }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setProvider: (provider) => set({ provider }),
  setUseLLM: (useLLM) => set({ useLLM }),
  setShowApiKey: (showApiKey) => set({ showApiKey }),
  setApiKey: (apiKey) => set({ apiKey }),
  setMonitoring: (monitoring) => set({ monitoring }),
  toggleDark: () => set({ dark: !get().dark }),

  appendLog: (line) => set({ logs: [...get().logs, line] }),

  setClientOrder: (clientOrder) => set({ clientOrder }),
  setSummaryText: (summaryText) => set({ summaryText }),

  analyzeFiles: async (files: File[]) => {
    if (!files || files.length === 0) return;
    try {
      const first = files[0];
      // Extraire la commande après le premier underscore jusqu'à l'extension
      const name = first.name || "";
      const underscore = name.indexOf("_");
      if (underscore >= 0) {
        const dot = name.lastIndexOf(".");
        const end = dot > underscore ? dot : name.length;
        const order = name.slice(underscore + 1, end);
        if (order) set({ clientOrder: order });
      }
      set({ activeTab: "summary" });
      const { useLLM } = get();
      get().appendLog(`[${new Date().toLocaleTimeString()}] Déclenchement analyse (bouton): ${first.name}`);
      console.log("[analyzeFiles] start", { file: first.name, useLLM });

      // Si LLM désactivé, ne pas lancer progression ni appel réseau
      if (!useLLM) {
        get().appendLog(`[${new Date().toLocaleTimeString()}] LLM désactivé, analyse ignorée`);
        console.log("[analyzeFiles] LLM disabled, skipping");
        return;
      }

      // Déclenche la progression UI
      get().startProcessing();
      const form = new FormData();
      form.append("file", first);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Échec analyse (${res.status}): ${text}`);
      }
      const data = (await res.json()) as { summary: string };
      set({ summaryText: data.summary });
      get().appendLog(`[${new Date().toLocaleTimeString()}] Analyse terminée`);
      console.log("[analyzeFiles] done", { summaryLen: data.summary?.length });
    } catch (err: any) {
      const message = err?.message || String(err);
      get().appendLog(`[${new Date().toLocaleTimeString()}] Erreur analyse: ${message}`);
      console.error("[analyzeFiles] error", err);
    }
  },

  startProcessing: () => {
    const { files } = get();
    if (!files.length) return;
    // reset
    set({
      processing: true,
      logs: [],
      steps: initialSteps.map((s) => ({ ...s, status: "idle" })),
    });
    console.log("[progress] start");
    const fail = Math.random() < 0.1;
    const stepIds = ["prepare", "parse", "analyze", "finalize"] as const;
    const durations = [800, 1200, 1500, 900];
    let idx = 0;

    const runNext = () => {
      if (idx >= stepIds.length) {
        set({ processing: false });
        console.log("[progress] all done");
        return;
      }
      const current = stepIds[idx];
      set({
        steps: get().steps.map((s) =>
          s.id === current ? { ...s, status: "running" } : s
        ),
      });
      get().appendLog(`[${new Date().toLocaleTimeString()}] Start: ${current}`);
      console.log("[progress] step start", current);
      const timer = setTimeout(() => {
        if (fail && current === "analyze") {
          set({
            steps: get().steps.map((s) =>
              s.id === current ? { ...s, status: "error" } : s
            ),
            processing: false,
          });
          get().appendLog(
            `[${new Date().toLocaleTimeString()}] Error in ${current}`
          );
          console.error("[progress] step error", current);
          return;
        }
        set({
          steps: get().steps.map((s) =>
            s.id === current ? { ...s, status: "done" } : s
          ),
        });
        get().appendLog(
          `[${new Date().toLocaleTimeString()}] Done: ${current}`
        );
        console.log("[progress] step done", current);
        idx += 1;
        runNext();
      }, durations[idx]);

      // metrics drift
      const m = get().metrics;
      const jitter = () =>
        Math.max(0, Math.min(100, Math.round((Math.random() - 0.5) * 10)));
      set({
        metrics: {
          cpu: Math.min(100, m.cpu + jitter()),
          ram: Math.min(100, m.ram + jitter()),
          disk: Math.min(100, m.disk + jitter()),
        },
      });
    };
    runNext();
  },

  retryProcessing: () => {
    set({
      logs: [
        ...get().logs,
        `[${new Date().toLocaleTimeString()}] Retry requested`,
      ],
    });
    get().startProcessing();
  },
    }),
    {
      name: "workshop-llm-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        apiKey: state.apiKey,
        provider: state.provider,
        useLLM: state.useLLM,
        dark: state.dark,
      }),
    }
  )
);
