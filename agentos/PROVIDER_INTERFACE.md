# AgentOS Provider Interface

**Version:** v0.0-control-pack  
**Last Updated:** January 29, 2025

This document defines the provider abstraction layer that allows YETO to swap AI providers without code changes.

---

## Design Principles

1. **Provider Agnostic**: All prompts and agent logic are independent of any specific AI provider
2. **Configuration-Based Switching**: Provider selection via environment variables, not code changes
3. **Unified Interface**: Single interface for all providers regardless of underlying API differences
4. **Graceful Degradation**: Fallback providers for reliability
5. **Cost Tracking**: Built-in token counting and cost estimation

---

## Provider Interface

```typescript
interface AIProvider {
  // Provider identification
  readonly name: string;
  readonly version: string;
  
  // Core completion method
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  
  // Streaming completion
  stream(request: CompletionRequest): AsyncIterable<StreamChunk>;
  
  // Embedding generation
  embed(texts: string[]): Promise<number[][]>;
  
  // Token counting
  countTokens(text: string): number;
  
  // Health check
  healthCheck(): Promise<HealthStatus>;
}

interface CompletionRequest {
  messages: Message[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  responseFormat?: 'text' | 'json';
  tools?: ToolDefinition[];
}

interface CompletionResponse {
  content: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'tool_call';
  toolCalls?: ToolCall[];
  metadata: ResponseMetadata;
}

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}
```

---

## Supported Providers

### Primary Provider: Manus Built-in

The default provider uses the Manus platform's built-in LLM service.

```typescript
class ManusProvider implements AIProvider {
  readonly name = 'manus';
  readonly version = '1.0.0';
  
  constructor(config: ManusConfig) {
    this.apiUrl = config.apiUrl || process.env.BUILT_IN_FORGE_API_URL;
    this.apiKey = config.apiKey || process.env.BUILT_IN_FORGE_API_KEY;
  }
}
```

**Configuration:**
```env
AI_PROVIDER=manus
BUILT_IN_FORGE_API_URL=<auto-injected>
BUILT_IN_FORGE_API_KEY=<auto-injected>
```

### Alternative Provider: OpenAI

For organizations preferring OpenAI directly.

```typescript
class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  readonly version = '1.0.0';
  
  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.model = config.model || 'gpt-4-turbo';
  }
}
```

**Configuration:**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo
```

### Alternative Provider: Anthropic

For organizations preferring Anthropic Claude.

```typescript
class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  readonly version = '1.0.0';
  
  constructor(config: AnthropicConfig) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = config.model || 'claude-3-sonnet';
  }
}
```

**Configuration:**
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet
```

### Alternative Provider: Azure OpenAI

For enterprise deployments using Azure.

```typescript
class AzureOpenAIProvider implements AIProvider {
  readonly name = 'azure-openai';
  readonly version = '1.0.0';
  
  constructor(config: AzureConfig) {
    this.endpoint = config.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
    this.apiKey = config.apiKey || process.env.AZURE_OPENAI_KEY;
    this.deployment = config.deployment || process.env.AZURE_OPENAI_DEPLOYMENT;
  }
}
```

**Configuration:**
```env
AI_PROVIDER=azure-openai
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

---

## Provider Factory

```typescript
class ProviderFactory {
  static create(providerName?: string): AIProvider {
    const name = providerName || process.env.AI_PROVIDER || 'manus';
    
    switch (name) {
      case 'manus':
        return new ManusProvider({});
      case 'openai':
        return new OpenAIProvider({});
      case 'anthropic':
        return new AnthropicProvider({});
      case 'azure-openai':
        return new AzureOpenAIProvider({});
      default:
        throw new Error(`Unknown provider: ${name}`);
    }
  }
}
```

---

## Fallback Chain

For high availability, configure a fallback chain:

```typescript
class FallbackProvider implements AIProvider {
  constructor(private providers: AIProvider[]) {}
  
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    for (const provider of this.providers) {
      try {
        return await provider.complete(request);
      } catch (error) {
        console.warn(`Provider ${provider.name} failed, trying next...`);
        continue;
      }
    }
    throw new Error('All providers failed');
  }
}
```

**Configuration:**
```env
AI_PROVIDER_FALLBACK=manus,openai,anthropic
```

---

## Cost Tracking

All providers implement cost tracking:

```typescript
interface CostTracker {
  // Track usage per request
  trackUsage(agentId: string, usage: TokenUsage): void;
  
  // Get usage summary
  getUsageSummary(period: 'day' | 'week' | 'month'): UsageSummary;
  
  // Set budget alerts
  setBudgetAlert(threshold: number, callback: () => void): void;
}

interface UsageSummary {
  totalTokens: number;
  totalCost: number;
  byAgent: Record<string, TokenUsage>;
  byProvider: Record<string, TokenUsage>;
}
```

---

## Provider-Specific Adaptations

### Prompt Formatting

Different providers may require different prompt formats:

```typescript
interface PromptAdapter {
  formatSystemPrompt(prompt: string): string;
  formatMessages(messages: Message[]): any;
  parseResponse(raw: any): CompletionResponse;
}
```

### Tool Calling

Tool definitions are normalized across providers:

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
}

// Adapters convert to provider-specific format
class OpenAIToolAdapter {
  toOpenAI(tool: ToolDefinition): OpenAIFunction { ... }
}

class AnthropicToolAdapter {
  toAnthropic(tool: ToolDefinition): AnthropicTool { ... }
}
```

---

## Environment Configuration

Complete environment configuration for provider switching:

```env
# Primary provider selection
AI_PROVIDER=manus

# Fallback chain (comma-separated)
AI_PROVIDER_FALLBACK=manus,openai

# Provider-specific settings
BUILT_IN_FORGE_API_URL=<auto>
BUILT_IN_FORGE_API_KEY=<auto>
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4

# Cost controls
AI_MONTHLY_BUDGET=1000
AI_ALERT_THRESHOLD=0.8

# Performance settings
AI_TIMEOUT_MS=30000
AI_MAX_RETRIES=3
AI_RETRY_DELAY_MS=1000
```

---

## Testing Provider Swap

To verify provider independence:

1. Run evaluation suite with primary provider
2. Switch provider via environment variable
3. Run same evaluation suite
4. Compare results for consistency

```bash
# Test with Manus
AI_PROVIDER=manus pnpm test:evals

# Test with OpenAI
AI_PROVIDER=openai pnpm test:evals

# Compare results
pnpm compare-evals manus openai
```

---

## Migration Guide

To switch providers in production:

1. **Prepare**: Ensure new provider credentials are configured
2. **Test**: Run evaluation suite with new provider in staging
3. **Monitor**: Enable detailed logging during transition
4. **Switch**: Update `AI_PROVIDER` environment variable
5. **Verify**: Check response quality and latency metrics
6. **Rollback**: If issues, revert `AI_PROVIDER` to previous value

---

## Control Pack Version

**Tag:** v0.0-control-pack
