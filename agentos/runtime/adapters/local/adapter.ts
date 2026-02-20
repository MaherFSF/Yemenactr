/**
 * Local/Deterministic Provider Adapter
 * 
 * This adapter provides deterministic responses without external AI calls.
 * Used for:
 * - Testing and development
 * - Offline mode
 * - When AI provider is unavailable
 * - Demo mode with seeded data
 * 
 * All responses are template-based and clearly marked as deterministic.
 */

import type {
  ProviderAdapter,
  GenerateOptions,
  GenerateResponse,
  EmbedOptions,
  EmbedResponse,
  RerankOptions,
  RerankResponse,
} from '../interface';

export class LocalAdapter implements ProviderAdapter {
  readonly providerId = 'local';
  readonly providerName = 'Local Deterministic';
  
  async isAvailable(): Promise<boolean> {
    // Local adapter is always available
    return true;
  }
  
  async generate(options: GenerateOptions): Promise<GenerateResponse> {
    // Extract the last user message
    const lastUserMessage = options.messages
      .filter(m => m.role === 'user')
      .pop();
    
    const userContent = typeof lastUserMessage?.content === 'string' 
      ? lastUserMessage.content 
      : 'No query provided';
    
    // Generate deterministic response based on query type
    const response = this.generateDeterministicResponse(userContent);
    
    return {
      id: `local-${Date.now()}`,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response,
        },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: userContent.length,
        completion_tokens: response.length,
        total_tokens: userContent.length + response.length,
      },
    };
  }
  
  async embed(options: EmbedOptions): Promise<EmbedResponse> {
    const inputs = Array.isArray(options.input) ? options.input : [options.input];
    const dimensions = options.dimensions ?? 1536;
    
    // Generate deterministic embeddings based on text hash
    const embeddings = inputs.map(text => this.generateDeterministicEmbedding(text, dimensions));
    
    return {
      embeddings,
      usage: {
        prompt_tokens: inputs.join(' ').length,
        total_tokens: inputs.join(' ').length,
      },
    };
  }
  
  async rerank(options: RerankOptions): Promise<RerankResponse> {
    // Simple keyword-based reranking
    const queryWords = options.query.toLowerCase().split(/\s+/);
    
    const scores = options.documents.map((doc, index) => {
      const docWords = doc.toLowerCase().split(/\s+/);
      const matchCount = queryWords.filter(w => docWords.includes(w)).length;
      return {
        index,
        score: matchCount / queryWords.length,
        document: doc,
      };
    });
    
    scores.sort((a, b) => b.score - a.score);
    
    return {
      results: scores.slice(0, options.top_k ?? 10),
    };
  }
  
  private generateDeterministicResponse(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Economic indicators
    if (lowerQuery.includes('exchange rate') || lowerQuery.includes('fx')) {
      return `[Deterministic Mode] Exchange rate analysis requires live data. Based on available evidence:
- The Yemeni Rial has experienced significant volatility since 2015
- Multiple exchange rate regimes exist (Aden vs Sana'a)
- For current rates, please refer to the Evidence Drawer for source citations
- This response is template-based; enable AI provider for detailed analysis`;
    }
    
    if (lowerQuery.includes('inflation') || lowerQuery.includes('prices')) {
      return `[Deterministic Mode] Inflation analysis requires live data. Key observations:
- Yemen has experienced high inflation since the conflict began
- Food prices are a major driver of cost of living
- Regional variations exist between different zones
- For current data, please check the Evidence Drawer
- This response is template-based; enable AI provider for detailed analysis`;
    }
    
    if (lowerQuery.includes('gdp') || lowerQuery.includes('growth')) {
      return `[Deterministic Mode] GDP analysis requires live data. Historical context:
- Yemen's economy contracted significantly after 2015
- Recovery has been uneven across regions
- Data availability is limited due to conflict
- For official estimates, refer to World Bank and IMF sources
- This response is template-based; enable AI provider for detailed analysis`;
    }
    
    if (lowerQuery.includes('aid') || lowerQuery.includes('humanitarian')) {
      return `[Deterministic Mode] Aid flow analysis requires live data. Key points:
- Yemen receives significant humanitarian assistance
- OCHA FTS tracks funding flows
- Gap between needs and funding persists
- For current funding status, check the Evidence Drawer
- This response is template-based; enable AI provider for detailed analysis`;
    }
    
    // Default response
    return `[Deterministic Mode] This query requires AI analysis which is currently unavailable.

The YETO platform is running in local/deterministic mode. To enable full AI capabilities:
1. Configure an AI provider in environment variables
2. Set AI_PROVIDER to 'openai' or 'anthropic'
3. Provide valid API credentials

For now, you can:
- Browse the dashboard for available data
- Check the Evidence Drawer for source citations
- Export data in CSV/JSON format
- View historical trends in charts

This response is template-based and does not reflect real-time analysis.`;
  }
  
  private generateDeterministicEmbedding(text: string, dimensions: number): number[] {
    // Generate a deterministic embedding based on text hash
    const hash = this.simpleHash(text);
    const embedding: number[] = [];
    
    for (let i = 0; i < dimensions; i++) {
      // Use hash to seed pseudo-random values
      const value = Math.sin(hash * (i + 1)) * 0.5;
      embedding.push(value);
    }
    
    // Normalize the embedding
    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / norm);
  }
  
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export default LocalAdapter;
