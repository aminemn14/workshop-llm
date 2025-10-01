import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type StepStatus = "idle" | "running" | "done" | "error";

export type Step = {
  id: string;
  label: string;
  status: StepStatus;
};

export type TabKey = "summary" | "config" | "preimport" | "logs" | "json" | "costs";

export type ProviderKey = "openai" | "anthropic" | "local" | "openrouter";

export type Metrics = {
  cpu: number;
  ram: number;
  disk: number;
};

export type LogLevel = "INFO" | "WARNING" | "ERROR" | "DEBUG";

export type LogEntry = {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
};

type Store = {
  files: File[];
  processing: boolean;
  logs: LogEntry[];
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
  logFilter: Record<LogLevel, boolean>;
  logSearch: string;
  autoScrollLogs: boolean;
  logRotationMax: number;

  // Données JSON/LLM
  llmMessages: { role: "system" | "user" | "assistant"; content: string }[];
  commandData: Record<string, unknown>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null;
  model: string | null;
  // Coûts (calculés côté client, en USD)
  costInputUSD: number;
  costOutputUSD: number;
  costTotalUSD: number;

  setFiles: (files: File[]) => void;
  clearFiles: () => void;
  setActiveTab: (tab: TabKey) => void;
  setProvider: (p: ProviderKey) => void;
  setUseLLM: (v: boolean) => void;
  setShowApiKey: (v: boolean) => void;
  setApiKey: (k: string) => void;
  startProcessing: () => void;
  retryProcessing: () => void;
  appendLog: (level: LogLevel, message: string) => void;
  clearLogs: () => void;
  setLogFilter: (level: LogLevel, enabled: boolean) => void;
  setLogSearch: (q: string) => void;
  setAutoScrollLogs: (v: boolean) => void;
  setMonitoring: (v: boolean) => void;
  toggleDark: () => void;
  setClientOrder: (v: string) => void;
  setSummaryText: (v: string) => void;
  setLLMData: (messages: { role: "system" | "user" | "assistant"; content: string }[], commandData: Record<string, unknown>) => void;
  setUsageAndCosts: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null, model?: string | null) => void;
  analyzeFiles: (files: File[]) => Promise<void>;
  completeProcessingSuccess: () => void;
  completeProcessingError: () => void;
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
  logFilter: { INFO: true, WARNING: true, ERROR: true, DEBUG: false },
  logSearch: "",
  autoScrollLogs: true,
  logRotationMax: 1000,
  llmMessages: [],
  commandData: {},
  usage: null,
  model: null,
  costInputUSD: 0,
  costOutputUSD: 0,
  costTotalUSD: 0,

  setFiles: (files) => set({ files }),
  clearFiles: () => set({ files: [] }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setProvider: (provider) => set({ provider }),
  setUseLLM: (useLLM) => set({ useLLM }),
  setShowApiKey: (showApiKey) => set({ showApiKey }),
  setApiKey: (apiKey) => set({ apiKey }),
  setMonitoring: (monitoring) => set({ monitoring }),
  toggleDark: () => set({ dark: !get().dark }),

  appendLog: (level, message) => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      level,
      message,
      timestamp: Date.now(),
    };
    const next = [...get().logs, entry];
    const max = get().logRotationMax;
    const rotated = next.length > max ? next.slice(next.length - max) : next;
    set({ logs: rotated });
  },
  clearLogs: () => set({ logs: [] }),
  setLogFilter: (level, enabled) => set({ logFilter: { ...get().logFilter, [level]: enabled } }),
  setLogSearch: (q) => set({ logSearch: q }),
  setAutoScrollLogs: (v) => set({ autoScrollLogs: v }),

  setClientOrder: (clientOrder) => set({ clientOrder }),
  setSummaryText: (summaryText) => set({ summaryText }),

  setLLMData: (messages, commandData) => set({ llmMessages: messages, commandData }),

  setUsageAndCosts: (usage, model) => {
    const pricingPerMTokens: Record<string, { inputUSD: number; outputUSD: number }> = {
      // Prix par 1M tokens (valeurs indicatives, ajustables)
      "openai/gpt-4o-mini": { inputUSD: 0.15, outputUSD: 0.60 },
      "openai/gpt-4o": { inputUSD: 5.0, outputUSD: 15.0 },
    };
    const selectedModel = model ?? get().model ?? "openai/gpt-4o-mini";
    const pricing = pricingPerMTokens[selectedModel] || { inputUSD: 0, outputUSD: 0 };
    let costIn = 0;
    let costOut = 0;
    let total = 0;
    if (usage) {
      costIn = (usage.prompt_tokens / 1_000_000) * pricing.inputUSD;
      costOut = (usage.completion_tokens / 1_000_000) * pricing.outputUSD;
      total = costIn + costOut;
    }
    set({ usage: usage || null, model: selectedModel, costInputUSD: costIn, costOutputUSD: costOut, costTotalUSD: total });
  },

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
      
      const { useLLM, provider } = get();
      get().appendLog("INFO", `Déclenchement analyse: ${first.name}`);
      get().appendLog("DEBUG", `Paramètres: useLLM=${useLLM}`);
      let providerLabel = "Local";
      if (provider === "openrouter") providerLabel = "OpenRouter";
      else if (provider === "openai") providerLabel = "OpenAI";
      else if (provider === "anthropic") providerLabel = "Anthropic";
      get().appendLog("INFO", `Fournisseur LLM sélectionné: ${providerLabel}`);
      console.log("[analyzeFiles] start", { file: first.name, useLLM });

      // Déclenche la progression UI
      get().startProcessing();
      const approxTokens = Math.max(1, Math.round(first.size / 4));
      get().appendLog("INFO", `Estimation tokens (PDF): ~${approxTokens.toLocaleString()}`);
      
      const form = new FormData();
      files.forEach(file => form.append("file", file));
      form.append("enrich_llm", useLLM ? "yes" : "no");
      form.append("llm_provider", provider === "openrouter" ? "openrouter" : "ollama");
      if (provider === "openrouter" && get().apiKey) {
        form.append("openrouter_api_key", get().apiKey);
      }
      
      const t0 = performance.now();
      get().appendLog("DEBUG", `Appel /api/upload → provider=${provider}`);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
      }
      const data = (await res.json()) as {
        results: Array<{
          filename: string;
          extraction_stats: { nb_caracteres: number; nb_mots: number; preview: string };
          texte_extrait: string;
          llm_result: string | null;
          usage: any;
          model: string | null;
          llm_data: any;
          donnees_client: any;
          articles: any[];
        }>;
        errors: string[] | null;
      };
      
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach(error => get().appendLog("ERROR", error));
      }
      
      if (data.results.length > 0) {
        const firstResult = data.results[0];
        // Ne pas afficher le texte brut extrait
        // Mettre uniquement les données structurées et coûts
        get().setLLMData(
          [], // Pas de messages séparés, on utilise llm_data directement
          firstResult.llm_data ?? {}
        );
        get().setUsageAndCosts(firstResult.usage || null, firstResult.model || undefined);
      }
      
      // 2) Appel complémentaire à /api/analyze pour remplir le résumé LLM
      try {
        get().appendLog("DEBUG", "Appel /api/analyze");
        const analyzeForm = new FormData();
        analyzeForm.append("file", first);
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          body: analyzeForm,
        });
        if (!analyzeRes.ok) {
          const txt = await analyzeRes.text();
          throw new Error(`HTTP ${analyzeRes.status} ${analyzeRes.statusText} - ${txt}`);
        }
        const analyzeData = (await analyzeRes.json()) as {
          summary: string;
          messages: { role: "system" | "user" | "assistant"; content: string }[];
          usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null;
          model: string | null;
          commandData: Record<string, unknown>;
        };

        // Remplir avec le résumé LLM
        set({ summaryText: analyzeData.summary });

        // Mettre à jour messages + données commande en fusionnant avec les données existantes (issues de /api/upload)
        const previousCommandData = get().commandData || {};
        const mergedCommandData = { ...previousCommandData, ...(analyzeData.commandData ?? {}) } as Record<string, unknown>;
        get().setLLMData(analyzeData.messages ?? [], mergedCommandData);

        // Mettre à jour usage + coûts depuis /api/analyze
        get().setUsageAndCosts(analyzeData.usage || null, analyzeData.model || undefined);
        get().appendLog("INFO", "Résumé LLM récupéré via /api/analyze");
      } catch (e: any) {
        get().appendLog("WARNING", `Analyse LLM (/api/analyze) ignorée: ${e?.message || String(e)}`);
      }
      
      const dt = Math.round(performance.now() - t0);
      get().appendLog("INFO", `Analyse terminée en ${dt} ms`);
      console.log("[analyzeFiles] done", { resultsCount: data.results.length });
      get().completeProcessingSuccess();
    } catch (err: any) {
      const message = err?.message || String(err);
      get().appendLog("ERROR", `Erreur analyse: ${message}`);
      console.error("[analyzeFiles] error", err);
      get().completeProcessingError();
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
    // Exécuter seulement jusqu'à l'étape "analyze". "finalize" sera déclenchée lorsque les données seront prêtes.
    const stepIds = ["prepare", "parse", "analyze"] as const;
    const durations = [800, 1200, 1500];
    let idx = 0;

    const runNext = () => {
      if (idx >= stepIds.length) return;
      const current = stepIds[idx];
      set({
        steps: get().steps.map((s) =>
          s.id === current ? { ...s, status: "running" } : s
        ),
      });
      get().appendLog("INFO", `Start: ${current}`);
      console.log("[progress] step start", current);
      setTimeout(() => {
        set({
          steps: get().steps.map((s) =>
            s.id === current ? { ...s, status: "done" } : s
          ),
        });
        get().appendLog("INFO", `Done: ${current}`);
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

  // Marque la dernière étape comme DONE et termine le traitement
  completeProcessingSuccess: () => {
    set({
      steps: get().steps.map((s) =>
        s.id === "finalize" ? { ...s, status: "done" } : s
      ),
      processing: false,
    });
    get().appendLog("INFO", "Done: finalize");
    console.log("[progress] finalize done");
  },

  // Marque la dernière étape comme ERROR et termine le traitement
  completeProcessingError: () => {
    set({
      steps: get().steps.map((s) =>
        s.id === "finalize" ? { ...s, status: "error" } : s
      ),
      processing: false,
    });
    get().appendLog("ERROR", "Erreur dans l'étape: finalize");
    console.error("[progress] finalize error");
  },

  retryProcessing: () => {
    set({ logs: [...get().logs, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      level: "INFO",
      message: "Retry requested",
      timestamp: Date.now(),
    }] });
    get().startProcessing();
  },
    }),
    {
      name: "workshop-llm-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // apiKey: state.apiKey,
        provider: state.provider,
        useLLM: state.useLLM,
        dark: state.dark,
      }),
    }
  )
);
