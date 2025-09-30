import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ApiKeyService } from "@/lib/api-keys";
import { LLMProvider } from "@/types/api-keys";

export type StepStatus = "idle" | "running" | "done" | "error";

export type Step = {
  id: string;
  label: string;
  status: StepStatus;
};

export type TabKey = "summary" | "config" | "preimport" | "logs" | "json" | "costs";

export type ProviderKey = LLMProvider;

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
  showApiKey: boolean;
  apiKey: string;
  steps: Step[];
  metrics: Metrics;
  monitoring: boolean;
  dark: boolean;
  apiKeyLoading: boolean;
  apiKeyError: string | null;
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
  loadApiKeyForProvider: (provider: ProviderKey) => Promise<void>;
  saveApiKey: (provider: ProviderKey, apiKey: string) => Promise<boolean>;
  loadActiveProvider: () => Promise<void>;
  setActiveProvider: (provider: ProviderKey) => Promise<boolean>;
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
  provider: LLMProvider.OPENAI,
  showApiKey: false,
  apiKey: "",
  steps: initialSteps,
  metrics: { cpu: 8, ram: 42, disk: 71 },
  monitoring: false,
  dark: false,
  apiKeyLoading: false,
  apiKeyError: null,
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
  setProvider: async (provider) => {
    const currentProvider = get().provider;
    
    // Éviter les appels inutiles si le provider n'a pas changé
    if (currentProvider === provider) return;
    
    set({ provider });
    
    try {
      // Définir le provider comme actif en base de données
      await get().setActiveProvider(provider);
      // Charger automatiquement la clé API pour le nouveau provider
      await get().loadApiKeyForProvider(provider);
    } catch (error) {
      console.error('Erreur lors du changement de provider:', error);
    }
  },
  setShowApiKey: (showApiKey) => set({ showApiKey }),
  setApiKey: (apiKey) => set({ apiKey }),
  setMonitoring: (monitoring) => set({ monitoring }),
  toggleDark: () => set({ dark: !get().dark }),

  // Charger la clé API pour un provider spécifique
  loadApiKeyForProvider: async (provider) => {
    try {
      set({ apiKeyLoading: true, apiKeyError: null });
      const apiKey = await ApiKeyService.getApiKeyForProvider(provider);
      set({ apiKey: apiKey || "", apiKeyLoading: false });
    } catch (error) {
      console.error('Erreur lors du chargement de la clé API:', error);
      set({ 
        apiKeyError: error instanceof Error ? error.message : 'Erreur lors du chargement',
        apiKeyLoading: false 
      });
    }
  },

  // Sauvegarder une clé API
  saveApiKey: async (provider, apiKey) => {
    try {
      set({ apiKeyLoading: true, apiKeyError: null });
      const result = await ApiKeyService.saveApiKey({ provider, api_key: apiKey });
      
      if (result.success) {
        set({ apiKey, apiKeyLoading: false });
        return true;
      } else {
        set({ 
          apiKeyError: result.error || 'Erreur lors de la sauvegarde',
          apiKeyLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        apiKeyError: error instanceof Error ? error.message : 'Erreur inconnue',
        apiKeyLoading: false 
      });
      return false;
    }
  },

  // Charger le provider actif au démarrage
  loadActiveProvider: async () => {
    try {
      const { provider: currentProvider } = get();
      // Éviter les appels si un provider est déjà défini
      if (currentProvider && currentProvider !== 'openai') return;
      
      const activeProvider = await ApiKeyService.getActiveProvider();
      if (activeProvider) {
        set({ provider: activeProvider });
        // Charger la clé API pour le provider actif
        await get().loadApiKeyForProvider(activeProvider);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du provider actif:', error);
    }
  },

  // Définir le provider actif
  setActiveProvider: async (provider) => {
    try {
      const result = await ApiKeyService.setActiveProvider(provider);
      return result.success;
    } catch (error) {
      console.error('Erreur lors de la définition du provider actif:', error);
      return false;
    }
  },



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
      const { provider } = get();
      get().appendLog("INFO", `Déclenchement analyse: ${first.name}`);

      get().appendLog("INFO", `Fournisseur LLM sélectionné: ${provider}`);
      // get().appendLog("INFO", "Modèle (tests): GPT-4o Mini");
      console.log("[analyzeFiles] start", { file: first.name });


      // Déclenche la progression UI (jusqu'à l'étape analyze)
      get().startProcessing();
      const approxTokens = Math.max(1, Math.round(first.size / 4));
      get().appendLog("INFO", `Estimation tokens (PDF): ~${approxTokens.toLocaleString()}`);
      // get().appendLog("INFO", "Modèle utilisé (tests): GPT-4o Mini");
      // get().appendLog("INFO", "Vérification solde: à effectuer côté serveur avant chaque lot");
      const form = new FormData();
      form.append("file", first);
      const t0 = performance.now();
      get().appendLog("DEBUG", `Appel /api/analyze → provider=${provider}`);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
      }
      const data = (await res.json()) as {
        summary: string;
        messages?: { role: "system" | "user" | "assistant"; content: string }[];
        usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        model?: string;
        commandData?: Record<string, unknown>;
      };
      set({ summaryText: data.summary });
      // Enregistrer JSON et coûts
      get().setLLMData(
        data.messages || [],
        data.commandData || { orderId: get().clientOrder }
      );
      get().setUsageAndCosts(data.usage || null, data.model || undefined);
      const dt = Math.round(performance.now() - t0);
      get().appendLog("INFO", `Analyse terminée en ${dt} ms`);
      console.log("[analyzeFiles] done", { summaryLen: data.summary?.length });
      // Finaliser la progression UNIQUEMENT quand les données sont prêtes
      get().completeProcessingSuccess();
    } catch (err: any) {
      const message = err?.message || String(err);
      get().appendLog("ERROR", `Erreur analyse: ${message}`);
      console.error("[analyzeFiles] error", err);
      // Marquer la progression en erreur immédiatement
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
        dark: state.dark,
      }),
    }
  )
);
