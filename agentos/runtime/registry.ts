/**
 * YETO AgentOS - Provider Registry
 * 
 * Manages AI provider adapters and handles provider switching.
 * This is the central point for all AI operations in the platform.
 */

import type { ProviderAdapter, ProviderRegistry } from './adapters/interface';
import { OpenAIAdapter } from './adapters/openai/adapter';
import { LocalAdapter } from './adapters/local/adapter';

class ProviderRegistryImpl implements ProviderRegistry {
  private adapters: Map<string, ProviderAdapter> = new Map();
  private activeProviderId: string = 'local';
  
  constructor() {
    // Register default adapters
    this.register(new OpenAIAdapter());
    this.register(new LocalAdapter());
    
    // Set active provider from environment
    const envProvider = process.env.AI_PROVIDER || 'local';
    if (this.adapters.has(envProvider)) {
      this.activeProviderId = envProvider;
    }
  }
  
  register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }
  
  getActive(): ProviderAdapter {
    const adapter = this.adapters.get(this.activeProviderId);
    if (!adapter) {
      // Fallback to local adapter
      return this.adapters.get('local')!;
    }
    return adapter;
  }
  
  setActive(providerId: string): void {
    if (!this.adapters.has(providerId)) {
      throw new Error(`Provider '${providerId}' is not registered`);
    }
    this.activeProviderId = providerId;
  }
  
  listProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
  
  async isProviderAvailable(providerId: string): Promise<boolean> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) return false;
    return adapter.isAvailable();
  }
  
  /**
   * Get provider with automatic fallback
   * If the active provider is unavailable, falls back to local adapter
   */
  async getWithFallback(): Promise<ProviderAdapter> {
    const active = this.getActive();
    const isAvailable = await active.isAvailable();
    
    if (isAvailable) {
      return active;
    }
    
    console.warn(`Provider '${active.providerId}' unavailable, falling back to local`);
    return this.adapters.get('local')!;
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistryImpl();

/**
 * Convenience functions for direct AI operations
 */
export async function generate(options: Parameters<ProviderAdapter['generate']>[0]) {
  const provider = await providerRegistry.getWithFallback();
  return provider.generate(options);
}

export async function embed(options: Parameters<ProviderAdapter['embed']>[0]) {
  const provider = await providerRegistry.getWithFallback();
  return provider.embed(options);
}

export async function rerank(options: Parameters<ProviderAdapter['rerank']>[0]) {
  const provider = await providerRegistry.getWithFallback();
  return provider.rerank(options);
}

export default providerRegistry;
