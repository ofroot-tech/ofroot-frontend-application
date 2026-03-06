export const AI_WORKSPACE_STORAGE_KEY = 'ofroot_ai_workspace_v1';

export type AiWorkspaceConfig = {
  provider: 'openai';
  apiKey: string;
  model?: string;
  companyName?: string;
  market?: string;
  website?: string;
};

export const DEFAULT_AI_MODEL = 'gpt-4.1-mini';

export function loadAiWorkspaceConfig(): AiWorkspaceConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AI_WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AiWorkspaceConfig>;
    if (!parsed || parsed.provider !== 'openai') return null;
    return {
      provider: 'openai',
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' ? parsed.model : DEFAULT_AI_MODEL,
      companyName: typeof parsed.companyName === 'string' ? parsed.companyName : '',
      market: typeof parsed.market === 'string' ? parsed.market : '',
      website: typeof parsed.website === 'string' ? parsed.website : '',
    };
  } catch {
    return null;
  }
}

export function saveAiWorkspaceConfig(config: AiWorkspaceConfig) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AI_WORKSPACE_STORAGE_KEY, JSON.stringify(config));
}
