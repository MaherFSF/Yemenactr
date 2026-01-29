/**
 * OpenAI-Compatible Provider Adapter
 * 
 * Works with OpenAI API and any OpenAI-compatible endpoint.
 * This is the default adapter for YETO.
 */

import type {
  ProviderAdapter,
  GenerateOptions,
  GenerateResponse,
  EmbedOptions,
  EmbedResponse,
  RerankOptions,
  RerankResponse,
  PROVIDER_ENV_VARS,
} from '../interface';

export class OpenAIAdapter implements ProviderAdapter {
  readonly providerId = 'openai';
  readonly providerName = 'OpenAI-Compatible';
  
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private embedModel: string;
  
  constructor(config?: {
    apiKey?: string;
    apiUrl?: string;
    model?: string;
    embedModel?: string;
  }) {
    this.apiKey = config?.apiKey || process.env.AI_API_KEY || '';
    this.apiUrl = config?.apiUrl || process.env.AI_API_URL || 'https://api.openai.com/v1';
    this.model = config?.model || process.env.AI_MODEL || 'gpt-4o';
    this.embedModel = config?.embedModel || process.env.AI_EMBED_MODEL || 'text-embedding-3-small';
  }
  
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.apiUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  async generate(options: GenerateOptions): Promise<GenerateResponse> {
    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 4096,
        tools: options.tools,
        tool_choice: options.tool_choice,
        response_format: options.response_format,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Generation failed: ${error}`);
    }
    
    return response.json();
  }
  
  async embed(options: EmbedOptions): Promise<EmbedResponse> {
    const input = Array.isArray(options.input) ? options.input : [options.input];
    
    const response = await fetch(`${this.apiUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.embedModel,
        input,
        dimensions: options.dimensions,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embedding failed: ${error}`);
    }
    
    const data = await response.json();
    return {
      embeddings: data.data.map((d: { embedding: number[] }) => d.embedding),
      usage: data.usage,
    };
  }
  
  async rerank(options: RerankOptions): Promise<RerankResponse> {
    // OpenAI doesn't have native reranking, so we use embeddings + cosine similarity
    const queryEmbed = await this.embed({ input: options.query });
    const docEmbeds = await this.embed({ input: options.documents });
    
    const scores = docEmbeds.embeddings.map((docEmbed, index) => ({
      index,
      score: cosineSimilarity(queryEmbed.embeddings[0], docEmbed),
      document: options.documents[index],
    }));
    
    scores.sort((a, b) => b.score - a.score);
    
    return {
      results: scores.slice(0, options.top_k ?? 10),
    };
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default OpenAIAdapter;
