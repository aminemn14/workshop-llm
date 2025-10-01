export enum LLMProvider {
  OPENROUTER = 'openrouter',
  OPENAI = 'openai',
  MISTRAL = 'mistral',
  GEMINI = 'gemini',
  OLLAMA = 'ollama',
  LOCAL = 'local'
}

export type LLMProviderKey = keyof typeof LLMProvider;

export interface ApiKey {
  id: string;
  user_id: string;
  provider: LLMProvider;
  api_key_encrypted: string;
  active: boolean;
  created_at: string;
}

export interface CreateApiKeyRequest {
  provider: LLMProvider;
  api_key: string;
}

// Labels et descriptions des providers
export const PROVIDER_LABELS: Record<LLMProvider, string> = {
  [LLMProvider.OPENROUTER]: 'OpenRouter',
  [LLMProvider.OPENAI]: 'OpenAI',
  [LLMProvider.MISTRAL]: 'Mistral AI',
  [LLMProvider.GEMINI]: 'Google Gemini',
  [LLMProvider.OLLAMA]: 'Ollama',
  [LLMProvider.LOCAL]: 'Local'
};

export const PROVIDER_DESCRIPTIONS: Record<LLMProvider, string> = {
  [LLMProvider.OPENROUTER]: 'Accès à plusieurs modèles via OpenRouter',
  [LLMProvider.OPENAI]: 'Modèles GPT d\'OpenAI',
  [LLMProvider.MISTRAL]: 'Modèles Mistral AI',
  [LLMProvider.GEMINI]: 'Modèles Google Gemini',
  [LLMProvider.OLLAMA]: 'Modèles locaux via Ollama',
  [LLMProvider.LOCAL]: 'Modèles locaux'
};

export interface ApiKeyResponse {
  success: boolean;
  data?: ApiKey;
  error?: string;
}
