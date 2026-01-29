# YETO - AI Provider Configuration Guide

This document explains how to configure and switch between AI providers in the YETO platform.

## Overview

YETO is designed to be **provider-agnostic**. All AI functionality is abstracted through a common interface, allowing you to:

1. Use any OpenAI-compatible API
2. Use Anthropic's Claude
3. Run in local/deterministic mode (no external AI)
4. Add custom provider adapters

## Environment Variables

Configure your AI provider using these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | Provider to use: `openai`, `anthropic`, `local` | `local` |
| `AI_API_KEY` | API key for the provider | (none) |
| `AI_API_URL` | Custom API endpoint | Provider default |
| `AI_MODEL` | Model for text generation | `gpt-4o` |
| `AI_EMBED_MODEL` | Model for embeddings | `text-embedding-3-small` |

## Provider Configurations

### OpenAI (Default)

```bash
AI_PROVIDER=openai
AI_API_KEY=sk-your-api-key
AI_MODEL=gpt-4o
AI_EMBED_MODEL=text-embedding-3-small
```

### OpenAI-Compatible (Azure, Together, etc.)

```bash
AI_PROVIDER=openai
AI_API_KEY=your-api-key
AI_API_URL=https://your-endpoint.com/v1
AI_MODEL=your-model-name
```

### Anthropic Claude

```bash
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-your-api-key
AI_MODEL=claude-3-opus-20240229
```

### Local/Deterministic Mode

```bash
AI_PROVIDER=local
# No API key needed
```

In local mode:
- All AI responses are template-based
- Embeddings are deterministic hashes
- Reranking uses keyword matching
- Clearly marked as "[Deterministic Mode]"

## Switching Providers at Runtime

The platform automatically falls back to local mode if the configured provider is unavailable:

```typescript
import { providerRegistry, generate } from '@/agentos/runtime/registry';

// Check available providers
const providers = providerRegistry.listProviders();

// Check if a provider is available
const isAvailable = await providerRegistry.isProviderAvailable('openai');

// Switch provider
providerRegistry.setActive('anthropic');

// Generate with automatic fallback
const response = await generate({
  messages: [{ role: 'user', content: 'Hello' }]
});
```

## Adding Custom Providers

Create a new adapter implementing the `ProviderAdapter` interface:

```typescript
// agentos/runtime/adapters/custom/adapter.ts
import type { ProviderAdapter } from '../interface';

export class CustomAdapter implements ProviderAdapter {
  readonly providerId = 'custom';
  readonly providerName = 'Custom Provider';
  
  async isAvailable(): Promise<boolean> {
    // Check if provider is configured and reachable
  }
  
  async generate(options): Promise<GenerateResponse> {
    // Implement text generation
  }
  
  async embed(options): Promise<EmbedResponse> {
    // Implement embeddings
  }
  
  async rerank(options): Promise<RerankResponse> {
    // Implement reranking
  }
}
```

Register in the registry:

```typescript
import { providerRegistry } from '@/agentos/runtime/registry';
import { CustomAdapter } from './adapters/custom/adapter';

providerRegistry.register(new CustomAdapter());
```

## No-Keys Mode

When running without AI provider credentials:

1. Platform still functions with all data features
2. AI Assistant shows deterministic responses
3. Scenario Simulator uses rule-based calculations
4. All AI-dependent features clearly marked as "Demo Mode"
5. No fake data is ever generated

## Security Considerations

1. **Never expose API keys in client code**
   - All AI calls go through server-side procedures
   - Keys are only accessible on the server

2. **Rate limiting**
   - AI endpoints are rate-limited
   - Prevents abuse and cost overruns

3. **Audit logging**
   - All AI calls are logged
   - Includes provider, model, token usage

## Troubleshooting

### Provider Unavailable

If you see "[Deterministic Mode]" responses:
1. Check `AI_PROVIDER` environment variable
2. Verify `AI_API_KEY` is set correctly
3. Check network connectivity to provider
4. Review server logs for errors

### High Latency

1. Consider using a faster model
2. Check if provider is experiencing issues
3. Enable response caching for common queries

### Token Limits

1. Reduce `max_tokens` in generation options
2. Truncate long context windows
3. Use summarization for large documents

## Cost Management

1. Monitor token usage in admin dashboard
2. Set up alerts for usage thresholds
3. Use local mode for development/testing
4. Cache common AI responses
