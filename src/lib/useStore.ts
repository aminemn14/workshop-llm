import { create } from "zustand";

export type StepStatus = "idle" | "running" | "done" | "error";

export type Step = {
  id: string;
  label: string;
  status: StepStatus;
};

export type TabKey = "summary" | "config" | "preimport" | "logs" | "debug";

export type ProviderKey = "openai" | "anthropic" | "local";

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
};

const initialSteps: Step[] = [
  { id: "prepare", label: "Préparation", status: "idle" },
  { id: "parse", label: "Parsing PDF", status: "idle" },
  { id: "analyze", label: "Analyse LLM", status: "idle" },
  { id: "finalize", label: "Finalisation", status: "idle" },
];

export const useStore = create<Store>((set, get) => ({
  files: [],
  processing: false,
  logs: [],
  activeTab: "summary",
  provider: "openai",
  useLLM: true,
  showApiKey: false,
  apiKey: "",
  steps: initialSteps,
  metrics: { cpu: 8, ram: 42, disk: 71 },
  monitoring: false,
  dark: false,

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

  startProcessing: () => {
    const { files } = get();
    if (!files.length) return;
    // reset
    set({
      processing: true,
      logs: [],
      steps: initialSteps.map((s) => ({ ...s, status: "idle" })),
    });
    const fail = Math.random() < 0.1;
    const stepIds = ["prepare", "parse", "analyze", "finalize"] as const;
    const durations = [800, 1200, 1500, 900];
    let idx = 0;

    const runNext = () => {
      if (idx >= stepIds.length) {
        set({ processing: false });
        return;
      }
      const current = stepIds[idx];
      set({
        steps: get().steps.map((s) =>
          s.id === current ? { ...s, status: "running" } : s
        ),
      });
      get().appendLog(`[${new Date().toLocaleTimeString()}] Start: ${current}`);
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
}));
