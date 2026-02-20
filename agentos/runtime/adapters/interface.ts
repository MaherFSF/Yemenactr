/**
 * YETO AgentOS - Provider Adapter Interface
 * 
 * This interface defines the contract that all AI provider adapters must implement.
 * The platform is provider-agnostic and can work with any LLM that implements this interface.
 * 
 * NO VENDOR NAMES IN UI OR DOCS - This is the non-branding rule.
 */

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[];
  name?: string;
  tool_call_id?: string;
}

export interface ContentPart {
  type: 'text' | 'image_url' | 'file_url';
  text?: string;
  image_url?: { url: string; detail?: 'auto' | 'low' | 'high' };
  file_url?: { url: string; mime_type?: string };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface GenerateOptions {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  tools?: Tool[];
  tool_choice?: 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } };
  response_format?: {
    type: 'text' | 'json_schema';
    json_schema?: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
}

export interface GenerateResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbedOptions {
  input: string | string[];
  dimensions?: number;
}

export interface EmbedResponse {
  embeddings: number[][];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface RerankOptions {
  query: string;
  documents: string[];
  top_k?: number;
}

export interface RerankResponse {
  results: Array<{
    index: number;
    score: number;
    document: string;
  }>;
}

/**
 * Provider Adapter Interface
 * 
 * All AI provider adapters must implement these three methods:
 * - generate(): For text generation and chat completions
 * - embed(): For creating vector embeddings
 * - rerank(): For reranking search results
 */
export interface ProviderAdapter {
  /** Provider identifier (e.g., 'openai', 'anthropic', 'local') */
  readonly providerId: string;
  
  /** Human-readable provider name for logs (not UI) */
  readonly providerName: string;
  
  /** Check if the provider is available and configured */
  isAvailable(): Promise<boolean>;
  
  /** Generate text/chat completion */
  generate(options: GenerateOptions): Promise<GenerateResponse>;
  
  /** Create vector embeddings */
  embed(options: EmbedOptions): Promise<EmbedResponse>;
  
  /** Rerank documents by relevance */
  rerank(options: RerankOptions): Promise<RerankResponse>;
}

/**
 * Provider Registry
 * 
 * Manages available provider adapters and selects the active one.
 */
export interface ProviderRegistry {
  /** Register a new provider adapter */
  register(adapter: ProviderAdapter): void;
  
  /** Get the currently active provider */
  getActive(): ProviderAdapter;
  
  /** Set the active provider by ID */
  setActive(providerId: string): void;
  
  /** List all registered providers */
  listProviders(): string[];
  
  /** Check if a specific provider is available */
  isProviderAvailable(providerId: string): Promise<boolean>;
}

/**
 * Environment Variables for Provider Configuration
 * 
 * AI_PROVIDER: Which provider to use ('openai', 'anthropic', 'local')
 * AI_API_KEY: API key for the provider (if required)
 * AI_API_URL: Custom API endpoint (for self-hosted or proxy)
 * AI_MODEL: Model identifier to use
 * AI_EMBED_MODEL: Model for embeddings (if different)
 */
export const PROVIDER_ENV_VARS = {
  AI_PROVIDER: 'AI_PROVIDER',
  AI_API_KEY: 'AI_API_KEY',
  AI_API_URL: 'AI_API_URL',
  AI_MODEL: 'AI_MODEL',
  AI_EMBED_MODEL: 'AI_EMBED_MODEL',
} as const;

/**
 * Default Provider Configuration
 */
export const DEFAULT_PROVIDER_CONFIG = {
  provider: 'openai',
  model: 'gpt-4o',
  embedModel: 'text-embedding-3-small',
  temperature: 0.7,
  maxTokens: 4096,
} as const;
